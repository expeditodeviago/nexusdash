# NEXUS DASH - Intelligent Data Analytics Platform

O **NEXUS DASH** é uma plataforma Full-Stack de análise de dados automatizada, integrada com Inteligência Artificial Generativa para transformar planilhas complexas em insights acionáveis em segundos.

---

## 🚀 Funcionalidades Principais

### 1. Engine de Processamento Inteligente
*   **Upload Multi-formato:** Suporte nativo para arquivos CSV e Excel (.xlsx).
*   **Limpeza Automática:** Tratamento de dados (Data Cleaning) em tempo real, lidando com moedas (R$, $), percentuais e diferentes formatos de separadores decimais.
*   **Detecção de Tipos:** Algoritmo de inferência para separar automaticamente variáveis categóricas de variáveis numéricas.

### 2. Dashboard Dinâmico e Visual
*   **Gráficos Reativos:** Visualizações interativas (Barras, Pizza, Área, Composta e Gráficos de Dispersão) utilizando a biblioteca Recharts.
*   **Análise Estatística:** Geração automática de Histogramas e Ogivas (Frequência Acumulada).
*   **Filtros em Tempo Real:** Sistema de filtragem global que atualiza todos os gráficos e métricas instantaneamente conforme o usuário seleciona categorias.

### 3. NEXUS AI (O Cérebro do Projeto)
*   **Chat com Dados:** Integração com o modelo Llama-3.1 via API da Groq para permitir que o usuário "converse" com seus dados.
*   **Contexto Estatístico:** A IA recebe um resumo tabular exato do arquivo (Markdown estatístico) para garantir respostas precisas sobre tendências, médias e anomalias, evitando alucinações.

### 4. Exportação Profissional
*   **Relatórios em PDF:** Exportação do painel completo para PDF, incluindo cabeçalho personalizado com logo, resumo estatístico e capturas dos gráficos ativos.

---

## 🛠️ Stack Tecnológica

### Frontend
*   **React + TypeScript:** Interface robusta e tipagem segura.
*   **Tailwind CSS:** Design moderno com sistema de Dark/Light mode.
*   **Framer Motion / Canvas:** Fundo dinâmico com "Teia Neural" e conexões animadas para alta fidelidade visual (UX/UI).

### Backend
*   **FastAPI (Python):** API de alta performance e baixa latência.
*   **Pandas & NumPy:** Engine pesado para processamento de dados e cálculos estatísticos.
*   **Uvicorn:** Servidor ASGI para produção.

---

## 🛡️ Destaques de Segurança (DevSecOps)
Este projeto foi submetido a uma auditoria estrita de segurança, implementando:
*   **Isolamento de Credenciais:** Zero hardcoded secrets; todas as chaves de API e URLs são geridas via variáveis de ambiente.
*   **Privacidade de Dados (Stateless):** Processamento em memória RAM via BytesIO. Os dados do usuário não são persistidos em disco, e o isolamento entre sessões é garantido por tokens UUID4.
*   **Hardened Headers:** Implementação de políticas de CORS restritas e headers de proteção (HSTS, NoSniff, XSS Protection).
*   **Sanitização de Input:** Validação de tamanho e extensão de arquivos (Limite de 10MB) e sanitização de prompts de chat.

---

## 💡 Por que este projeto é relevante?
Ele demonstra a capacidade de unir **ciência de dados**, **engenharia de software** e **experiência do usuário**. Diferente de dashboards estáticos, o Nexus Dash resolve o problema de usuários que possuem dados mas não sabem como analisá-los, utilizando a IA como uma ponte entre a informação bruta e a decisão estratégica.
