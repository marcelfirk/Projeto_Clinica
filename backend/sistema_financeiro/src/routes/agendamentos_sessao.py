# API para AgendamentoSessao

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from src.models.agendamento_sessao import AgendamentoSessao, db
from src.models.paciente import Paciente
from src.models.pacote_tratamento import PacoteTratamento
from src.models.local_atendimento import LocalAtendimento
from datetime import datetime, time

agendamentos_sessao_bp = Blueprint('agendamentos_sessao', __name__)

@agendamentos_sessao_bp.route('/', methods=['GET'])
@jwt_required()
def listar_agendamentos_sessao():
    """Endpoint para listar todos os agendamentos de sessão"""
    agendamentos = AgendamentoSessao.query.all()
    
    resultado = []
    for agendamento in agendamentos:
        resultado.append(agendamento.to_dict())
    
    return jsonify(resultado), 200

@agendamentos_sessao_bp.route('/<int:id>', methods=['GET'])
@jwt_required()
def obter_agendamento_sessao(id):
    """Endpoint para obter um agendamento de sessão específico"""
    agendamento = AgendamentoSessao.query.get(id)
    
    if not agendamento:
        return jsonify({"msg": "Agendamento de sessão não encontrado"}), 404
    
    return jsonify(agendamento.to_dict()), 200

@agendamentos_sessao_bp.route('/paciente/<int:paciente_id>', methods=['GET'])
@jwt_required()
def listar_agendamentos_por_paciente(paciente_id):
    """Endpoint para listar agendamentos de sessão de um paciente específico"""
    # Verifica se paciente existe
    paciente = Paciente.query.get(paciente_id)
    if not paciente:
        return jsonify({"msg": "Paciente não encontrado"}), 404
    
    agendamentos = AgendamentoSessao.query.filter_by(paciente_id=paciente_id).all()
    
    resultado = []
    for agendamento in agendamentos:
        resultado.append(agendamento.to_dict())
    
    return jsonify(resultado), 200

@agendamentos_sessao_bp.route('/pacote/<int:pacote_id>', methods=['GET'])
@jwt_required()
def listar_agendamentos_por_pacote(pacote_id):
    """Endpoint para listar agendamentos de sessão de um pacote específico"""
    # Verifica se pacote existe
    pacote = PacoteTratamento.query.get(pacote_id)
    if not pacote:
        return jsonify({"msg": "Pacote de tratamento não encontrado"}), 404
    
    agendamentos = AgendamentoSessao.query.filter_by(pacote_tratamento_id=pacote_id).all()
    
    resultado = []
    for agendamento in agendamentos:
        resultado.append(agendamento.to_dict())
    
    return jsonify(resultado), 200

@agendamentos_sessao_bp.route('/', methods=['POST'])
@jwt_required()
def criar_agendamento_sessao():
    """Endpoint para criar um novo agendamento de sessão"""
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    
    # Campos obrigatórios
    paciente_id = request.json.get('paciente_id', None)
    pacote_tratamento_id = request.json.get('pacote_tratamento_id', None)
    data_agendamento = request.json.get('data_agendamento', None)
    horario_inicio = request.json.get('horario_inicio', None)
    local_atendimento_id = request.json.get('local_atendimento_id', None)
    
    if not all([paciente_id, pacote_tratamento_id, data_agendamento, horario_inicio, local_atendimento_id]):
        return jsonify({"msg": "Todos os campos obrigatórios devem ser preenchidos"}), 400
    
    # Verifica se paciente existe
    paciente = Paciente.query.get(paciente_id)
    if not paciente:
        return jsonify({"msg": "Paciente não encontrado"}), 404
    
    # Verifica se pacote de tratamento existe
    pacote = PacoteTratamento.query.get(pacote_tratamento_id)
    if not pacote:
        return jsonify({"msg": "Pacote de tratamento não encontrado"}), 404
    
    # Verifica se o paciente do agendamento é o mesmo do pacote
    if pacote.paciente_id != paciente_id:
        return jsonify({"msg": "Paciente do agendamento deve ser o mesmo do pacote de tratamento"}), 400
    
    # Verifica se ainda há sessões disponíveis no pacote
    if pacote.numero_sessoes_realizadas >= pacote.numero_sessoes_contratadas:
        return jsonify({"msg": "Todas as sessões do pacote já foram agendadas/realizadas"}), 400
    
    # Verifica se local de atendimento existe
    local = LocalAtendimento.query.get(local_atendimento_id)
    if not local:
        return jsonify({"msg": "Local de atendimento não encontrado"}), 404
    
    try:
        # Converte string para data
        data_agend = datetime.fromisoformat(data_agendamento.replace('Z', '+00:00')).date()
    except ValueError:
        return jsonify({"msg": "Formato de data inválido. Use ISO 8601 (YYYY-MM-DD)"}), 400
    
    try:
        # Converte string para time
        horario = datetime.strptime(horario_inicio, '%H:%M').time()
    except ValueError:
        return jsonify({"msg": "Formato de horário inválido. Use HH:MM"}), 400
    
    # Calcula o número da próxima sessão
    proxima_sessao = pacote.numero_sessoes_realizadas + 1
    
    # Processa horário de fim se fornecido
    horario_fim_obj = None
    if 'horario_fim' in request.json and request.json['horario_fim']:
        try:
            horario_fim_obj = datetime.strptime(request.json['horario_fim'], '%H:%M').time()
        except ValueError:
            return jsonify({"msg": "Formato de horário de fim inválido. Use HH:MM"}), 400
    
    # Cria novo agendamento de sessão
    novo_agendamento = AgendamentoSessao(
        paciente_id=paciente_id,
        pacote_tratamento_id=pacote_tratamento_id,
        data_agendamento=data_agend,
        horario_inicio=horario,
        horario_fim=horario_fim_obj,
        local_atendimento_id=local_atendimento_id,
        status_sessao=request.json.get('status_sessao', 'agendada'),
        numero_sessao=proxima_sessao,
        observacoes=request.json.get('observacoes')
    )
    
    # Valida regras de negócio
    valido, mensagem = novo_agendamento.validar()
    if not valido:
        return jsonify({"msg": mensagem}), 400
    
    db.session.add(novo_agendamento)
    
    # Incrementa o número de sessões realizadas no pacote
    pacote.numero_sessoes_realizadas += 1
    
    # Se todas as sessões foram agendadas, pode marcar como concluído (opcional)
    # if pacote.numero_sessoes_realizadas >= pacote.numero_sessoes_contratadas:
    #     pacote.status_pacote = 'concluido'
    
    db.session.commit()
    
    return jsonify({
        "msg": "Agendamento de sessão criado com sucesso",
        "agendamento_sessao": novo_agendamento.to_dict()
    }), 201

@agendamentos_sessao_bp.route('/<int:id>', methods=['PUT'])
@jwt_required()
def atualizar_agendamento_sessao(id):
    """Endpoint para atualizar um agendamento de sessão existente"""
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    
    agendamento = AgendamentoSessao.query.get(id)
    
    if not agendamento:
        return jsonify({"msg": "Agendamento de sessão não encontrado"}), 404
    
    # Atualiza campos
    if 'data_agendamento' in request.json:
        try:
            agendamento.data_agendamento = datetime.fromisoformat(request.json['data_agendamento'].replace('Z', '+00:00')).date()
        except ValueError:
            return jsonify({"msg": "Formato de data inválido. Use ISO 8601 (YYYY-MM-DD)"}), 400
    
    if 'horario_inicio' in request.json:
        try:
            agendamento.horario_inicio = datetime.strptime(request.json['horario_inicio'], '%H:%M').time()
        except ValueError:
            return jsonify({"msg": "Formato de horário inválido. Use HH:MM"}), 400
    
    if 'horario_fim' in request.json:
        if request.json['horario_fim']:
            try:
                agendamento.horario_fim = datetime.strptime(request.json['horario_fim'], '%H:%M').time()
            except ValueError:
                return jsonify({"msg": "Formato de horário de fim inválido. Use HH:MM"}), 400
        else:
            agendamento.horario_fim = None
    
    if 'local_atendimento_id' in request.json:
        local = LocalAtendimento.query.get(request.json['local_atendimento_id'])
        if not local:
            return jsonify({"msg": "Local de atendimento não encontrado"}), 404
        agendamento.local_atendimento_id = request.json['local_atendimento_id']
    
    if 'status_sessao' in request.json:
        agendamento.status_sessao = request.json['status_sessao']
    
    if 'observacoes' in request.json:
        agendamento.observacoes = request.json['observacoes']
    
    # Valida regras de negócio
    valido, mensagem = agendamento.validar()
    if not valido:
        return jsonify({"msg": mensagem}), 400
    
    db.session.commit()
    
    return jsonify({
        "msg": "Agendamento de sessão atualizado com sucesso",
        "agendamento_sessao": agendamento.to_dict()
    }), 200

@agendamentos_sessao_bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def excluir_agendamento_sessao(id):
    """Endpoint para excluir um agendamento de sessão"""
    agendamento = AgendamentoSessao.query.get(id)
    
    if not agendamento:
        return jsonify({"msg": "Agendamento de sessão não encontrado"}), 404
    
    # Decrementa o número de sessões realizadas no pacote
    pacote = agendamento.pacote_tratamento
    if pacote:
        pacote.numero_sessoes_realizadas = max(0, pacote.numero_sessoes_realizadas - 1)
    
    db.session.delete(agendamento)
    db.session.commit()
    
    return jsonify({"msg": "Agendamento de sessão excluído com sucesso"}), 200

@agendamentos_sessao_bp.route('/<int:id>/marcar-realizada', methods=['POST'])
@jwt_required()
def marcar_sessao_realizada(id):
    """Endpoint para marcar uma sessão como realizada"""
    agendamento = AgendamentoSessao.query.get(id)
    
    if not agendamento:
        return jsonify({"msg": "Agendamento de sessão não encontrado"}), 404
    
    agendamento.status_sessao = 'realizada'
    
    # Verifica se todas as sessões do pacote foram realizadas
    pacote = agendamento.pacote_tratamento
    sessoes_realizadas = AgendamentoSessao.query.filter_by(
        pacote_tratamento_id=pacote.id,
        status_sessao='realizada'
    ).count()
    
    if sessoes_realizadas >= pacote.numero_sessoes_contratadas:
        pacote.status_pacote = 'concluido'
    
    db.session.commit()
    
    return jsonify({
        "msg": "Sessão marcada como realizada com sucesso",
        "agendamento_sessao": agendamento.to_dict()
    }), 200

