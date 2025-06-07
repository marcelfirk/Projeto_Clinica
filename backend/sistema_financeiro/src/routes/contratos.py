from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.contrato import Contrato, db
from src.models.paciente import Paciente
from datetime import datetime

contratos_bp = Blueprint('contratos', __name__)

@contratos_bp.route('/', methods=['GET'])
@jwt_required()
def listar_contratos():
    """Endpoint para listar todos os contratos"""
    contratos = Contrato.query.all()
    
    resultado = []
    for contrato in contratos:
        resultado.append({
            "id": contrato.id,
            "identificador_contrato": contrato.identificador_contrato,
            "paciente_id": contrato.paciente_id,
            "paciente_nome": contrato.paciente.nome if contrato.paciente else None,
            "procedimento": contrato.procedimento,
            "data_procedimento": contrato.data_procedimento.isoformat() if contrato.data_procedimento else None,
            "local_realizacao": contrato.local_realizacao,
            "valor_total": float(contrato.valor_total),
            "status": contrato.status,
            "data_criacao": contrato.data_criacao.isoformat(),
            "data_atualizacao": contrato.data_atualizacao.isoformat()
        })
    
    return jsonify(resultado), 200

@contratos_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def obter_contrato(id):
    """Endpoint para obter um contrato específico"""
    contrato = Contrato.query.get(id)
    
    if not contrato:
        return jsonify({"msg": "Contrato não encontrado"}), 404
    
    return jsonify({
        "id": contrato.id,
        "identificador_contrato": contrato.identificador_contrato,
        "paciente_id": contrato.paciente_id,
        "paciente_nome": contrato.paciente.nome if contrato.paciente else None,
        "procedimento": contrato.procedimento,
        "data_procedimento": contrato.data_procedimento.isoformat() if contrato.data_procedimento else None,
        "local_realizacao": contrato.local_realizacao,
        "valor_total": float(contrato.valor_total),
        "status": contrato.status,
        "data_criacao": contrato.data_criacao.isoformat(),
        "data_atualizacao": contrato.data_atualizacao.isoformat()
    }), 200

@contratos_bp.route('/', methods=['POST'])
@jwt_required()
def criar_contrato():
    """Endpoint para criar um novo contrato"""
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    
    # Campos obrigatórios
    paciente_id = request.json.get('paciente_id', None)
    procedimento = request.json.get('procedimento', None)
    data_procedimento = request.json.get('data_procedimento', None)
    local_realizacao = request.json.get('local_realizacao', None)
    valor_total = request.json.get('valor_total', None)
    
    if not paciente_id or not procedimento or not data_procedimento or not local_realizacao or valor_total is None:
        return jsonify({"msg": "Paciente, procedimento, data, local e valor são obrigatórios"}), 400
    
    # Verifica se paciente existe
    paciente = Paciente.query.get(paciente_id)
    if not paciente:
        return jsonify({"msg": "Paciente não encontrado"}), 404
    
    try:
        # Converte string para data
        data_procedimento = datetime.fromisoformat(data_procedimento.replace('Z', '+00:00'))
    except ValueError:
        return jsonify({"msg": "Formato de data inválido. Use ISO 8601 (YYYY-MM-DD)"}), 400
    
    try:
        # Converte valor para float
        valor_total = float(valor_total)
    except ValueError:
        return jsonify({"msg": "Valor total deve ser um número"}), 400
    
    # Gera identificador único
    identificador_contrato = Contrato.gerar_identificador()
    
    # Cria novo contrato
    novo_contrato = Contrato(
        identificador_contrato=identificador_contrato,
        paciente_id=paciente_id,
        procedimento=procedimento,
        data_procedimento=data_procedimento,
        local_realizacao=local_realizacao,
        valor_total=valor_total,
        status=request.json.get('status', 'ativo')
    )
    
    db.session.add(novo_contrato)
    db.session.commit()
    
    return jsonify({
        "msg": "Contrato criado com sucesso",
        "contrato": {
            "id": novo_contrato.id,
            "identificador_contrato": novo_contrato.identificador_contrato,
            "paciente_id": novo_contrato.paciente_id,
            "paciente_nome": paciente.nome,
            "procedimento": novo_contrato.procedimento,
            "data_procedimento": novo_contrato.data_procedimento.isoformat(),
            "local_realizacao": novo_contrato.local_realizacao,
            "valor_total": float(novo_contrato.valor_total),
            "status": novo_contrato.status,
            "data_criacao": novo_contrato.data_criacao.isoformat(),
            "data_atualizacao": novo_contrato.data_atualizacao.isoformat()
        }
    }), 201

@contratos_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def atualizar_contrato(id):
    """Endpoint para atualizar um contrato existente"""
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    
    contrato = Contrato.query.get(id)
    
    if not contrato:
        return jsonify({"msg": "Contrato não encontrado"}), 404
    
    # Atualiza campos
    if 'paciente_id' in request.json:
        paciente = Paciente.query.get(request.json['paciente_id'])
        if not paciente:
            return jsonify({"msg": "Paciente não encontrado"}), 404
        contrato.paciente_id = request.json['paciente_id']
    
    if 'procedimento' in request.json:
        contrato.procedimento = request.json['procedimento']
    
    if 'data_procedimento' in request.json:
        try:
            contrato.data_procedimento = datetime.fromisoformat(request.json['data_procedimento'].replace('Z', '+00:00'))
        except ValueError:
            return jsonify({"msg": "Formato de data inválido. Use ISO 8601 (YYYY-MM-DD)"}), 400
    
    if 'local_realizacao' in request.json:
        contrato.local_realizacao = request.json['local_realizacao']
    
    if 'valor_total' in request.json:
        try:
            contrato.valor_total = float(request.json['valor_total'])
        except ValueError:
            return jsonify({"msg": "Valor total deve ser um número"}), 400
    
    if 'status' in request.json:
        contrato.status = request.json['status']
    
    db.session.commit()
    
    return jsonify({
        "msg": "Contrato atualizado com sucesso",
        "contrato": {
            "id": contrato.id,
            "identificador_contrato": contrato.identificador_contrato,
            "paciente_id": contrato.paciente_id,
            "paciente_nome": contrato.paciente.nome if contrato.paciente else None,
            "procedimento": contrato.procedimento,
            "data_procedimento": contrato.data_procedimento.isoformat() if contrato.data_procedimento else None,
            "local_realizacao": contrato.local_realizacao,
            "valor_total": float(contrato.valor_total),
            "status": contrato.status,
            "data_criacao": contrato.data_criacao.isoformat(),
            "data_atualizacao": contrato.data_atualizacao.isoformat()
        }
    }), 200

@contratos_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def excluir_contrato(id):
    """Endpoint para excluir um contrato"""
    contrato = Contrato.query.get(id)
    
    if not contrato:
        return jsonify({"msg": "Contrato não encontrado"}), 404
    
    # Verifica se contrato possui lançamentos
    if contrato.lancamentos:
        return jsonify({"msg": "Não é possível excluir contrato com lançamentos associados"}), 400
    
    db.session.delete(contrato)
    db.session.commit()
    
    return jsonify({"msg": "Contrato excluído com sucesso"}), 200

@contratos_bp.route('/paciente/<int:paciente_id>', methods=['GET'])
@jwt_required()
def listar_contratos_por_paciente(paciente_id):
    """Endpoint para listar contratos de um paciente específico"""
    # Verifica se paciente existe
    paciente = Paciente.query.get(paciente_id)
    if not paciente:
        return jsonify({"msg": "Paciente não encontrado"}), 404
    
    contratos = Contrato.query.filter_by(paciente_id=paciente_id).all()
    
    resultado = []
    for contrato in contratos:
        resultado.append({
            "id": contrato.id,
            "identificador_contrato": contrato.identificador_contrato,
            "paciente_id": contrato.paciente_id,
            "paciente_nome": paciente.nome,
            "procedimento": contrato.procedimento,
            "data_procedimento": contrato.data_procedimento.isoformat() if contrato.data_procedimento else None,
            "local_realizacao": contrato.local_realizacao,
            "valor_total": float(contrato.valor_total),
            "status": contrato.status,
            "data_criacao": contrato.data_criacao.isoformat(),
            "data_atualizacao": contrato.data_atualizacao.isoformat()
        })
    
    return jsonify(resultado), 200
