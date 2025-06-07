import os
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import pandas as pd
from src.models.user import User, db
from src.bi_integration import get_lancamentos_data, get_contratos_data, get_fluxo_caixa_mensal

bi_bp = Blueprint('bi', __name__)

@bi_bp.route('/export/lancamentos', methods=['GET'])
@jwt_required()
def export_lancamentos():
    """
    Endpoint para exportar dados de lançamentos financeiros para BI
    Requer autenticação JWT
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"msg": "Usuário não encontrado"}), 404
    
    # Aqui poderia ter uma verificação adicional de permissões
    # if not user.has_permission('export_data'):
    #     return jsonify({"msg": "Sem permissão para exportar dados"}), 403
    
    try:
        df = get_lancamentos_data()
        
        if df.empty:
            return jsonify({"msg": "Nenhum dado encontrado"}), 404
        
        # Converte para formato JSON
        result = df.to_dict(orient='records')
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"msg": f"Erro ao exportar dados: {str(e)}"}), 500

@bi_bp.route('/export/contratos', methods=['GET'])
@jwt_required()
def export_contratos():
    """
    Endpoint para exportar dados de contratos para BI
    Requer autenticação JWT
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"msg": "Usuário não encontrado"}), 404
    
    try:
        df = get_contratos_data()
        
        if df.empty:
            return jsonify({"msg": "Nenhum dado encontrado"}), 404
        
        # Converte para formato JSON
        result = df.to_dict(orient='records')
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"msg": f"Erro ao exportar dados: {str(e)}"}), 500

@bi_bp.route('/export/fluxo-caixa', methods=['GET'])
@jwt_required()
def export_fluxo_caixa():
    """
    Endpoint para exportar dados de fluxo de caixa para BI
    Requer autenticação JWT
    """
    current_user_id = get_jwt_identity()
    # Garantir que o ID do usuário seja uma string para compatibilidade
    if isinstance(current_user_id, int):
        current_user_id = str(current_user_id)
    user = User.query.get(int(current_user_id))
    
    if not user:
        return jsonify({"msg": "Usuário não encontrado"}), 404
    
    try:
        df = get_fluxo_caixa_mensal()
        
        if df.empty:
            return jsonify({"msg": "Nenhum dado encontrado"}), 404
        
        # Converte para formato JSON
        result = df.to_dict(orient='records')
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"msg": f"Erro ao exportar dados: {str(e)}"}), 500

@bi_bp.route('/export/csv/<string:tipo>', methods=['GET'])
@jwt_required()
def export_csv(tipo):
    """
    Endpoint para exportar dados em formato CSV
    Requer autenticação JWT
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"msg": "Usuário não encontrado"}), 404
    
    try:
        if tipo == 'lancamentos':
            df = get_lancamentos_data()
            filename = "lancamentos_financeiros.csv"
        elif tipo == 'contratos':
            df = get_contratos_data()
            filename = "contratos.csv"
        elif tipo == 'fluxo-caixa':
            df = get_fluxo_caixa_mensal()
            filename = "fluxo_caixa_mensal.csv"
        else:
            return jsonify({"msg": "Tipo de exportação inválido"}), 400
        
        if df.empty:
            return jsonify({"msg": "Nenhum dado encontrado"}), 404
        
        # Cria diretório de exportação se não existir
        export_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'exports')
        os.makedirs(export_dir, exist_ok=True)
        
        # Salva o arquivo CSV
        filepath = os.path.join(export_dir, filename)
        df.to_csv(filepath, index=False)
        
        # Em um ambiente real, retornaria o arquivo para download
        # Aqui apenas retornamos o caminho do arquivo
        return jsonify({
            "msg": "Arquivo CSV gerado com sucesso",
            "filepath": filepath,
            "rows": len(df)
        })
    
    except Exception as e:
        return jsonify({"msg": f"Erro ao exportar dados: {str(e)}"}), 500

@bi_bp.route('/export/excel', methods=['GET'])
@jwt_required()
def export_excel():
    """
    Endpoint para exportar todos os dados em formato Excel
    Requer autenticação JWT
    """
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"msg": "Usuário não encontrado"}), 404
    
    try:
        # Obtém todos os dados
        lancamentos_df = get_lancamentos_data()
        contratos_df = get_contratos_data()
        fluxo_caixa_df = get_fluxo_caixa_mensal()
        
        if lancamentos_df.empty and contratos_df.empty and fluxo_caixa_df.empty:
            return jsonify({"msg": "Nenhum dado encontrado"}), 404
        
        # Cria diretório de exportação se não existir
        export_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'exports')
        os.makedirs(export_dir, exist_ok=True)
        
        # Salva o arquivo Excel
        filename = "relatorio_financeiro.xlsx"
        filepath = os.path.join(export_dir, filename)
        
        with pd.ExcelWriter(filepath) as writer:
            if not lancamentos_df.empty:
                lancamentos_df.to_excel(writer, sheet_name="Lançamentos", index=False)
            if not contratos_df.empty:
                contratos_df.to_excel(writer, sheet_name="Contratos", index=False)
            if not fluxo_caixa_df.empty:
                fluxo_caixa_df.to_excel(writer, sheet_name="Fluxo de Caixa", index=False)
        
        # Em um ambiente real, retornaria o arquivo para download
        # Aqui apenas retornamos o caminho do arquivo
        return jsonify({
            "msg": "Arquivo Excel gerado com sucesso",
            "filepath": filepath,
            "sheets": {
                "lancamentos": 0 if lancamentos_df.empty else len(lancamentos_df),
                "contratos": 0 if contratos_df.empty else len(contratos_df),
                "fluxo_caixa": 0 if fluxo_caixa_df.empty else len(fluxo_caixa_df)
            }
        })
    
    except Exception as e:
        return jsonify({"msg": f"Erro ao exportar dados: {str(e)}"}), 500
