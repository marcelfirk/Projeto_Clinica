# API para PacoteTratamento

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.pacote_tratamento import PacoteTratamento, db
from src.models.paciente import Paciente
from src.models.tipo_tratamento import TipoTratamento
from datetime import datetime

pacotes_tratamento_bp = Blueprint('pacotes_tratamento', __name__)

@pacotes_tratamento_bp.route('/', methods=['GET'])
@jwt_required()
def listar_pacotes_tratamento():
    """Endpoint para listar todos os pacotes de tratamento"""
    pacotes = PacoteTratamento.query.all()
    
    resultado = []
    for pacote in pacotes:
        resultado.append(pacote.to_dict())
    
    return jsonify(resultado), 200

@pacotes_tratamento_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def obter_pacote_tratamento(id):
    """Endpoint para obter um pacote de tratamento específico"""
    pacote = PacoteTratamento.query.get(id)
    
    if not pacote:
        return jsonify({"msg": "Pacote de tratamento não encontrado"}), 404
    
    return jsonify(pacote.to_dict()), 200

@pacotes_tratamento_bp.route('/paciente/<int:paciente_id>', methods=['GET'])
@jwt_required()
def listar_pacotes_por_paciente(paciente_id):
    """Endpoint para listar pacotes de tratamento de um paciente específico"""
    # Verifica se paciente existe
    paciente = Paciente.query.get(paciente_id)
    if not paciente:
        return jsonify({"msg": "Paciente não encontrado"}), 404
    
    pacotes = PacoteTratamento.query.filter_by(paciente_id=paciente_id).all()
    
    resultado = []
    for pacote in pacotes:
        resultado.append(pacote.to_dict())
    
    return jsonify(resultado), 200

@pacotes_tratamento_bp.route('/pendentes', methods=['GET'])
@jwt_required()
def listar_pacotes_com_sessoes_pendentes():
    """Endpoint para listar pacotes com sessões pendentes"""
    pacotes = PacoteTratamento.query.filter(
        PacoteTratamento.numero_sessoes_realizadas < PacoteTratamento.numero_sessoes_contratadas,
        PacoteTratamento.status_pacote == 'ativo'
    ).all()
    
    resultado = []
    for pacote in pacotes:
        pacote_dict = pacote.to_dict()
        pacote_dict['sessoes_pendentes'] = pacote.sessoes_restantes
        resultado.append(pacote_dict)
    
    return jsonify(resultado), 200

@pacotes_tratamento_bp.route('/', methods=['POST'])
@jwt_required()
def criar_pacote_tratamento():
    """Endpoint para criar um novo pacote de tratamento"""
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    
    # Campos obrigatórios
    paciente_id = request.json.get('paciente_id', None)
    tipo_tratamento_id = request.json.get('tipo_tratamento_id', None)
    descricao = request.json.get('descricao', None)
    data_inicio_tratamento = request.json.get('data_inicio_tratamento', None)
    numero_sessoes_contratadas = request.json.get('numero_sessoes_contratadas', None)
    valor_total_pacote = request.json.get('valor_total_pacote', None)
    
    if not all([paciente_id, tipo_tratamento_id, descricao, data_inicio_tratamento, numero_sessoes_contratadas, valor_total_pacote]):
        return jsonify({"msg": "Todos os campos obrigatórios devem ser preenchidos"}), 400
    
    # Verifica se paciente existe
    paciente = Paciente.query.get(paciente_id)
    if not paciente:
        return jsonify({"msg": "Paciente não encontrado"}), 404
    
    # Verifica se tipo de tratamento existe
    tipo_tratamento = TipoTratamento.query.get(tipo_tratamento_id)
    if not tipo_tratamento:
        return jsonify({"msg": "Tipo de tratamento não encontrado"}), 404
    
    try:
        # Converte string para data
        data_inicio = datetime.fromisoformat(data_inicio_tratamento.replace('Z', '+00:00')).date()
    except ValueError:
        return jsonify({"msg": "Formato de data inválido. Use ISO 8601 (YYYY-MM-DD)"}), 400
    
    try:
        # Converte valores para tipos apropriados
        numero_sessoes = int(numero_sessoes_contratadas)
        valor_total = float(valor_total_pacote)
    except ValueError:
        return jsonify({"msg": "Número de sessões deve ser um inteiro e valor total deve ser um número"}), 400
    
    # Cria novo pacote de tratamento
    novo_pacote = PacoteTratamento(
        paciente_id=paciente_id,
        tipo_tratamento_id=tipo_tratamento_id,
        descricao=descricao,
        data_inicio_tratamento=data_inicio,
        numero_sessoes_contratadas=numero_sessoes,
        valor_total_pacote=valor_total,
        status_pacote=request.json.get('status_pacote', 'ativo'),
        observacoes=request.json.get('observacoes')
    )
    
    # Valida regras de negócio
    valido, mensagem = novo_pacote.validar()
    if not valido:
        return jsonify({"msg": mensagem}), 400
    
    db.session.add(novo_pacote)
    db.session.commit()
    
    return jsonify({
        "msg": "Pacote de tratamento criado com sucesso",
        "pacote_tratamento": novo_pacote.to_dict()
    }), 201

@pacotes_tratamento_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def atualizar_pacote_tratamento(id):
    """Endpoint para atualizar um pacote de tratamento existente"""
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    
    pacote = PacoteTratamento.query.get(id)
    
    if not pacote:
        return jsonify({"msg": "Pacote de tratamento não encontrado"}), 404
    
    # Atualiza campos
    if 'paciente_id' in request.json:
        paciente = Paciente.query.get(request.json['paciente_id'])
        if not paciente:
            return jsonify({"msg": "Paciente não encontrado"}), 404
        pacote.paciente_id = request.json['paciente_id']
    
    if 'tipo_tratamento_id' in request.json:
        tipo_tratamento = TipoTratamento.query.get(request.json['tipo_tratamento_id'])
        if not tipo_tratamento:
            return jsonify({"msg": "Tipo de tratamento não encontrado"}), 404
        pacote.tipo_tratamento_id = request.json['tipo_tratamento_id']
    
    if 'descricao' in request.json:
        pacote.descricao = request.json['descricao']
    
    if 'data_inicio_tratamento' in request.json:
        try:
            pacote.data_inicio_tratamento = datetime.fromisoformat(request.json['data_inicio_tratamento'].replace('Z', '+00:00')).date()
        except ValueError:
            return jsonify({"msg": "Formato de data inválido. Use ISO 8601 (YYYY-MM-DD)"}), 400
    
    if 'numero_sessoes_contratadas' in request.json:
        try:
            pacote.numero_sessoes_contratadas = int(request.json['numero_sessoes_contratadas'])
        except ValueError:
            return jsonify({"msg": "Número de sessões deve ser um inteiro"}), 400
    
    if 'numero_sessoes_realizadas' in request.json:
        try:
            pacote.numero_sessoes_realizadas = int(request.json['numero_sessoes_realizadas'])
        except ValueError:
            return jsonify({"msg": "Número de sessões realizadas deve ser um inteiro"}), 400
    
    if 'valor_total_pacote' in request.json:
        try:
            pacote.valor_total_pacote = float(request.json['valor_total_pacote'])
        except ValueError:
            return jsonify({"msg": "Valor total deve ser um número"}), 400
    
    if 'status_pacote' in request.json:
        pacote.status_pacote = request.json['status_pacote']
    
    if 'observacoes' in request.json:
        pacote.observacoes = request.json['observacoes']
    
    # Valida regras de negócio
    valido, mensagem = pacote.validar()
    if not valido:
        return jsonify({"msg": mensagem}), 400
    
    db.session.commit()
    
    return jsonify({
        "msg": "Pacote de tratamento atualizado com sucesso",
        "pacote_tratamento": pacote.to_dict()
    }), 200

@pacotes_tratamento_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def excluir_pacote_tratamento(id):
    """Endpoint para excluir um pacote de tratamento"""
    pacote = PacoteTratamento.query.get(id)
    
    if not pacote:
        return jsonify({"msg": "Pacote de tratamento não encontrado"}), 404
    
    # Verifica se há agendamentos de sessão vinculados
    if pacote.agendamentos_sessao:
        return jsonify({"msg": "Não é possível excluir pacote com agendamentos de sessão vinculados"}), 400
    
    # Verifica se há lançamentos financeiros vinculados
    if pacote.lancamentos_financeiros:
        return jsonify({"msg": "Não é possível excluir pacote com lançamentos financeiros vinculados"}), 400
    
    db.session.delete(pacote)
    db.session.commit()
    
    return jsonify({"msg": "Pacote de tratamento excluído com sucesso"}), 200

@pacotes_tratamento_bp.route('/<int:id>/incrementar-sessao', methods=['POST'])
@jwt_required()
def incrementar_sessao_realizada(id):
    """Endpoint para incrementar o número de sessões realizadas"""
    pacote = PacoteTratamento.query.get(id)
    
    if not pacote:
        return jsonify({"msg": "Pacote de tratamento não encontrado"}), 404
    
    if pacote.numero_sessoes_realizadas >= pacote.numero_sessoes_contratadas:
        return jsonify({"msg": "Todas as sessões já foram realizadas"}), 400
    
    pacote.numero_sessoes_realizadas += 1
    
    # Se todas as sessões foram realizadas, marca como concluído
    if pacote.numero_sessoes_realizadas >= pacote.numero_sessoes_contratadas:
        pacote.status_pacote = 'concluido'
    
    db.session.commit()
    
    return jsonify({
        "msg": "Sessão incrementada com sucesso",
        "pacote_tratamento": pacote.to_dict()
    }), 200

