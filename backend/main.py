from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import numpy as np
from typing import List, Dict, Any, Optional

app = FastAPI(title="NexusDash Core API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    
    # Criar as faixas (bins) usando pandas para maior precisão nos rótulos
    try:
        # pd.cut cria categorias baseadas nos valores
        counts = pd.cut(numeric_data, bins=bins).value_counts().sort_index()
        
        result = []
        for interval, count in counts.items():
            # Formatar o intervalo de forma amigável: "X a Y"
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
        # Fallback para numpy se o pd.cut falhar por algum motivo (ex: valores constantes)
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

@app.post("/api/upload")
async def process_data(file: UploadFile = File(...)):
    try:
        content = await file.read()
        if file.filename.endswith('.csv'):
            try: df = pd.read_csv(io.BytesIO(content), encoding='utf-8')
            except: df = pd.read_csv(io.BytesIO(content), encoding='latin-1')
        else:
            df = pd.read_excel(io.BytesIO(content))

        # Limpeza e Normalização
        cols_to_drop = [c for c in df.columns if any(x in str(c).lower() for x in ['carimbo', 'timestamp', 'unnamed', 'index'])]
        df = df.drop(columns=cols_to_drop)

        # Conversão de Tipos
        for col in df.columns:
            if df[col].dtype == 'object':
                df[col] = df[col].apply(clean_numeric_data)
            try: df[col] = pd.to_numeric(df[col])
            except: pass

        num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        cat_cols = df.select_dtypes(exclude=[np.number]).columns.tolist()

        # Agregação Base (Top 10 Frequência) para todos
        series_data = {}
        for col in df.columns:
            # Frequência básica (usada para Barras, Pizza, Radar, etc.)
            counts = df[col].value_counts().head(10)
            base_agg = [{"name": str(n), "value": int(v)} for n, v in counts.items()]
            
            # Histograma real para numéricos
            hist_agg = []
            ogiva_agg = []
            if col in num_cols:
                hist_agg = calculate_histogram(df[col])
                acc = 0
                for h in hist_agg:
                    acc += h['frequencia']
                    ogiva_agg.append({"faixa": f"Até {h['max']:.1f}", "frequencia": acc})
            
            series_data[col] = {
                "base": base_agg,
                "histogram": hist_agg,
                "ogiva": ogiva_agg,
                "is_numeric": col in num_cols
            }

        # Filtros
        filtros = []
        for col in cat_cols:
            unique_vals = sorted([str(v) for v in df[col].unique() if v != "N/A"])
            if 1 < len(unique_vals) <= 50:
                filtros.append({"coluna": col, "opcoes": unique_vals})

        return {
            "sucesso": True,
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

@app.get("/api/health")
async def health(): return {"status": "online"}
