import requests
import sys

url = 'http://localhost:8000'

def run():
    print("--- SIMULAÇÃO NEXUS DASH ---")
    try:
        # 1. Upload
        print("[1/3] Testando Upload...")
        with open('test_data.csv', 'rb') as f:
            r = requests.post(url + '/api/upload', files={'file': f}).json()
        
        if not r.get('sucesso'):
            print(f"Erro no Upload: {r.get('erro')}")
            return

        fid = r['file_id']
        col = list(r['series'].keys())[0]
        ins = r['series'][col]['insight']
        print(f"Upload OK! ID: {fid}")
        print(f"Insight Gerado ({col}): {ins}")

        # 2. Chat AI (NEXUS)
        print("[2/3] Testando Chat NEXUS (IA)...")
        c = requests.post(url + '/api/nexus/chat', json={'pergunta': 'Qual o resumo destes dados?', 'file_id': fid}).json()
        
        if c.get('sucesso'):
            res = c['resposta']
            print(f"Chat OK! Resposta: {res[:150]}...")
        else:
            print(f"Erro no Chat: {c.get('erro')}")

        # 3. Verificação de Histograma
        print("[3/3] Verificando Lógica de Histograma...")
        # Procura por uma coluna numérica que tenha histograma
        for col_name, col_data in r['series'].items():
            if col_data.get('is_numeric') and col_data.get('histogram'):
                h = col_data['histogram'][0]
                print(f"Histograma OK na coluna {col_name}: {h['faixa']} -> {h['frequencia']}")
                break
        
        print("\n--- SIMULAÇÃO CONCLUÍDA COM SUCESSO ---")

    except Exception as e:
        print(f"Falha Crítica na Simulação: {e}")

if __name__ == "__main__":
    run()
