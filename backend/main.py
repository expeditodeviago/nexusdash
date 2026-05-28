from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import io
import numpy as np
import os
import uuid
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

app = FastAPI(title="NexusDash Core API")

# Configuração de Segurança de Origens (CORS)
ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Middleware para Headers de Segurança
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# Configuração Groq
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

# Armazenamento em memória (para o Chat)
DATA_STORE = {}

class ChatRequest(BaseModel):
    pergunta: str
    file_id: str

def clean_numeric_data(val):
    """Limpa moedas, percentuais e formatações brasileiras/americanas."""
    if pd.isna(val) or val == '': return 0.0
    if isinstance(val, (int, float)): return float(val)
    s = str(val).strip().replace('R$', '').replace('$', '').replace('%', '').replace(' ', '')
    try:
        if '.' in s and ',' in s:
            if s.rfind('.') < s.rfind(','): s = s.replace('.', '').replace(',', '.')
            else: s = s.replace(',', '')
        elif ',' in s: s = s.replace(',', '.')
        return float(s)
    except: return val

def calculate_histogram(series, bins=10):
    """Calcula distribuição de frequência real usando pd.cut para faixas precisas."""
    numeric_data = pd.to_numeric(series, errors='coerce').dropna()
    if numeric_data.empty: return []
    
    try:
        counts = pd.cut(numeric_data, bins=bins).value_counts().sort_index()
        result = []
        for interval, count in counts.items():
            label = f"{interval.left:.1f} a {interval.right:.1f}"
            result.append({
                "faixa": label,
                "frequencia": int(count),
                "min": float(interval.left),
                "max": float(interval.right)
            })
        return result
    except Exception as e:
        print(f"Erro no histograma: {e}")
        counts, bin_edges = np.histogram(numeric_data, bins=bins)
        return [
            {
                "faixa": f"{bin_edges[i]:.1f} a {bin_edges[i+1]:.1f}",
                "frequencia": int(counts[i]),
                "min": float(bin_edges[i]),
                "max": float(bin_edges[i+1])
            }
            for i in range(len(counts))
        ]

def generate_insight(col_name, is_numeric, df):
    """Algoritmo analítico simples para gerar o insight do gráfico."""
    if is_numeric:
        numeric_data = pd.to_numeric(df[col_name], errors='coerce').dropna()
        if numeric_data.empty:
            return f"Dados insuficientes para análise da coluna {col_name}."
        min_val = numeric_data.min()
        max_val = numeric_data.max()
        mean_val = numeric_data.mean()
        return f"Os valores de {col_name} variam de {min_val:.1f} a {max_val:.1f}, com média em torno de {mean_val:.1f}."
    else:
        counts = df[col_name].value_counts()
        if counts.empty:
            return f"Dados insuficientes para análise da coluna {col_name}."
        top_cat = counts.index[0]
        top_val = counts.iloc[0]
        total = len(df[col_name].dropna())
        pct = (top_val / total) * 100 if total > 0 else 0
        return f"A categoria '{top_cat}' é a mais frequente com {top_val} registros, representando {pct:.1f}% do total."


@app.post("/api/upload")
async def process_data(file: UploadFile = File(...)):
    # --- Auditoria de Segurança: Validação de Payload ---
    MAX_FILE_SIZE = 10 * 1024 * 1024  # Limite de 10MB
    content = await file.read()
    
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="Arquivo muito grande. Limite de 10MB.")
    
    allowed_extensions = {'.csv', '.xlsx', '.xls'}
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Extensão de arquivo não permitida.")
    # --------------------------------------------------

    try:
        if file_ext == '.csv':
            try: df = pd.read_csv(io.BytesIO(content), encoding='utf-8')
            except: df = pd.read_csv(io.BytesIO(content), encoding='latin-1')
        else:
            df = pd.read_excel(io.BytesIO(content))

        cols_to_drop = [c for c in df.columns if any(x in str(c).lower() for x in ['carimbo', 'timestamp', 'unnamed', 'index'])]
        df = df.drop(columns=cols_to_drop)

        for col in df.columns:
            if df[col].dtype == 'object':
                df[col] = df[col].apply(clean_numeric_data)
            try: df[col] = pd.to_numeric(df[col])
            except: pass

        num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        cat_cols = df.select_dtypes(exclude=[np.number]).columns.tolist()

        series_data = {}
        for col in df.columns:
            counts = df[col].value_counts().head(10)
            base_agg = [{"name": str(n), "value": int(v)} for n, v in counts.items()]
            
            hist_agg = []
            ogiva_agg = []
            is_num = col in num_cols
            if is_num:
                hist_agg = calculate_histogram(df[col])
                acc = 0
                for h in hist_agg:
                    acc += h['frequencia']
                    ogiva_agg.append({"faixa": f"Até {h['max']:.1f}", "frequencia": acc})
            
            insight = generate_insight(col, is_num, df)
            
            series_data[col] = {
                "base": base_agg,
                "histogram": hist_agg,
                "ogiva": ogiva_agg,
                "is_numeric": is_num,
                "insight": insight
            }

        filtros = []
        for col in cat_cols:
            unique_vals = sorted([str(v) for v in df[col].unique() if v != "N/A"])
            if 1 < len(unique_vals) <= 50:
                filtros.append({"coluna": col, "opcoes": unique_vals})

        # Armazenar dados para o chat
        file_id = str(uuid.uuid4())
        DATA_STORE[file_id] = df

        return {
            "sucesso": True,
            "file_id": file_id,
            "metricas": {
                "total_registros": len(df),
                "total_colunas": len(df.columns),
                "colunas_numericas": num_cols,
                "colunas_categoricas": cat_cols
            },
            "series": series_data,
            "filtros": filtros,
            "dados_preview": df.to_dict(orient='records')
        }
    except Exception as e:
        return {"sucesso": False, "erro": str(e)}

@app.post("/api/nexus/chat")
async def nexus_chat(req: ChatRequest):
    # --- Auditoria de Segurança: Sanitização de Input ---
    if len(req.pergunta) > 1000:
        return {"sucesso": False, "erro": "Pergunta excede o limite de 1000 caracteres."}
    
    pergunta_sanitizada = req.pergunta.strip()
    # ----------------------------------------------------

    if not groq_client:
        return {"sucesso": False, "erro": "API Key do Groq não configurada."}
    
    df = DATA_STORE.get(req.file_id)
    if df is None:
        return {"sucesso": False, "erro": "Arquivo não encontrado. Faça upload novamente."}
    
    # Extrair resumo estatístico detalhado para contexto
    try:
        # describe(include='all') fornece estatísticas para numéricos e categóricos
        resumo_estatistico = df.describe(include='all').transpose().to_markdown()
    except:
        resumo_estatistico = "Não foi possível gerar um resumo tabular, mas o arquivo possui " + str(len(df)) + " registros."

    sys_prompt = (
        "Você é o NEXUS, um analista de dados especialista e objetivo. "
        "Aqui está o resumo estatístico exato do arquivo atual:\n\n"
        f"{resumo_estatistico}\n\n"
        "Responda à pergunta do usuário de forma cirúrgica, citando os números reais, tendências e médias presentes neste resumo. "
        "Se a pergunta for fora do escopo destes dados numéricos, informe que você só pode analisar as estatísticas do arquivo."
    )
    
    try:
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": sys_prompt},
                {"role": "user", "content": pergunta_sanitizada}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.2,
            max_tokens=1024,
        )
        resposta = chat_completion.choices[0].message.content
        return {"sucesso": True, "resposta": resposta}
    except Exception as e:
        return {"sucesso": False, "erro": f"Erro na IA: {str(e)}"}

@app.get("/api/health")
async def health(): return {"status": "online"}
