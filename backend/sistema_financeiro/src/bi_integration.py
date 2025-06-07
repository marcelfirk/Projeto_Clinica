import os
import pandas as pd
import sqlalchemy
from sqlalchemy import create_engine, text

# Removendo dependência de dotenv para simplificar
# from dotenv import load_dotenv
# load_dotenv()

# Configuração da conexão com o banco de dados
def get_db_connection():
    """
    Cria e retorna uma conexão com o banco de dados MySQL
    """
    db_user = os.getenv('DB_USERNAME', 'root')
    db_password = os.getenv('DB_PASSWORD', 'password')
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = os.getenv('DB_PORT', '3306')
    db_name = os.getenv('DB_NAME', 'mydb')
    
    connection_string = f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    engine = create_engine(connection_string)
    
    return engine

# Funções para extração de dados para BI
def get_lancamentos_data():
    """
    Extrai dados de lançamentos financeiros para análise
    """
    engine = get_db_connection()
    
    query = """
    SELECT 
        l.id, l.tipo, l.valor, l.data_vencimento, l.data_pagamento, 
        l.status, l.numero_nota_fiscal, l.observacoes,
        c.identificador_contrato, c.procedimento, c.data_procedimento,
        p.nome as paciente_nome, p.cpf as paciente_cpf,
        f.nome as fornecedor_nome, f.cpf_cnpj as fornecedor_documento
    FROM lancamento_financeiro l
    LEFT JOIN contrato c ON l.contrato_id = c.id
    LEFT JOIN paciente p ON c.paciente_id = p.id
    LEFT JOIN fornecedor f ON l.fornecedor_id = f.id
    """
    
    try:
        df = pd.read_sql(query, engine)
        return df
    except Exception as e:
        print(f"Erro ao extrair dados de lançamentos: {e}")
        return pd.DataFrame()

def get_contratos_data():
    """
    Extrai dados de contratos para análise
    """
    engine = get_db_connection()
    
    query = """
    SELECT 
        c.id, c.identificador_contrato, c.procedimento, 
        c.data_procedimento, c.local_realizacao, c.valor_total, c.status,
        p.nome as paciente_nome, p.cpf as paciente_cpf
    FROM contrato c
    JOIN paciente p ON c.paciente_id = p.id
    """
    
    try:
        df = pd.read_sql(query, engine)
        return df
    except Exception as e:
        print(f"Erro ao extrair dados de contratos: {e}")
        return pd.DataFrame()

def get_fluxo_caixa_mensal():
    """
    Gera relatório de fluxo de caixa mensal
    """
    engine = get_db_connection()
    
    query = """
    SELECT 
        DATE_FORMAT(data_pagamento, '%Y-%m') as mes,
        tipo,
        SUM(valor) as total
    FROM lancamento_financeiro
    WHERE status = 'pago' AND data_pagamento IS NOT NULL
    GROUP BY DATE_FORMAT(data_pagamento, '%Y-%m'), tipo
    ORDER BY mes
    """
    
    try:
        df = pd.read_sql(query, engine)
        return df
    except Exception as e:
        print(f"Erro ao gerar fluxo de caixa: {e}")
        return pd.DataFrame()

def export_to_csv(dataframe, filename):
    """
    Exporta um DataFrame para CSV
    """
    try:
        dataframe.to_csv(filename, index=False)
        print(f"Dados exportados com sucesso para {filename}")
        return True
    except Exception as e:
        print(f"Erro ao exportar dados: {e}")
        return False

def export_to_excel(dataframe_dict, filename):
    """
    Exporta múltiplos DataFrames para um arquivo Excel com múltiplas abas
    """
    try:
        with pd.ExcelWriter(filename) as writer:
            for sheet_name, df in dataframe_dict.items():
                df.to_excel(writer, sheet_name=sheet_name, index=False)
        print(f"Dados exportados com sucesso para {filename}")
        return True
    except Exception as e:
        print(f"Erro ao exportar dados para Excel: {e}")
        return False

# Exemplo de uso
if __name__ == "__main__":
    # Extrair dados
    lancamentos_df = get_lancamentos_data()
    contratos_df = get_contratos_data()
    fluxo_caixa_df = get_fluxo_caixa_mensal()
    
    # Exportar para CSV
    export_to_csv(lancamentos_df, "lancamentos_financeiros.csv")
    export_to_csv(contratos_df, "contratos.csv")
    export_to_csv(fluxo_caixa_df, "fluxo_caixa_mensal.csv")
    
    # Exportar para Excel (múltiplas abas)
    export_to_excel({
        "Lançamentos": lancamentos_df,
        "Contratos": contratos_df,
        "Fluxo de Caixa": fluxo_caixa_df
    }, "relatorio_financeiro.xlsx")
