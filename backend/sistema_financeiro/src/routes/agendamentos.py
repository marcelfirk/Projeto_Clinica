from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from datetime import date
from src.models.agendamento_cirurgico import AgendamentoCirurgico
from src.models.agendamento_sessao import AgendamentoSessao
from src.models.paciente import Paciente
from src.models.procedimento import Procedimento
from src.models.local_atendimento import LocalAtendimento
from src.models.equipe import Equipe
from src.models.categoria_procedimento import CategoriaProcedimento
from src.models.pacote_tratamento import PacoteTratamento
from sqlalchemy.orm import joinedload
from src.models.paciente import db

agendamentos_geral_bp = Blueprint('agendamentos_geral', __name__)

@agendamentos_geral_bp.route("/por-periodo", methods=["GET"])
@jwt_required()
def listar_agendamentos_por_periodo():
    start_date_str = request.args.get('start')
    end_date_str = request.args.get('end')
    
    if not start_date_str or not end_date_str:
        return jsonify({"msg": "Parâmetros 'start' e 'end' são obrigatórios"}), 400
    
    try:
        start_date = date.fromisoformat(start_date_str)
        end_date = date.fromisoformat(end_date_str)
    except ValueError:
        return jsonify({"msg": "Formato de data inválido. Use ISO 8601 (YYYY-MM-DD)"}), 400

    # 🔍 Busca Agendamentos Cirúrgicos
    agendamentos_cirurgicos = AgendamentoCirurgico.query.filter(
        AgendamentoCirurgico.data_agendamento >= start_date,
        AgendamentoCirurgico.data_agendamento <= end_date
    ).options(
        joinedload(AgendamentoCirurgico.paciente),
        joinedload(AgendamentoCirurgico.procedimento),
        joinedload(AgendamentoCirurgico.equipe),
        joinedload(AgendamentoCirurgico.local_atendimento)
    ).all()

    # 🔍 Busca Agendamentos de Sessão
    agendamentos_sessoes = AgendamentoSessao.query.filter(
        AgendamentoSessao.data_agendamento >= start_date,
        AgendamentoSessao.data_agendamento <= end_date
    ).options(
        joinedload(AgendamentoSessao.paciente),
        joinedload(AgendamentoSessao.local_atendimento),
        joinedload(AgendamentoSessao.pacote_tratamento)
    ).all()

    eventos = []

    # 🔧 Mapeia Cirurgias para o calendário
    for ag in agendamentos_cirurgicos:
        eventos.append({
            "id": f"cirurgia-{ag.id}",
            "title": f"Cirurgia: {ag.paciente.nome} - {ag.procedimento.nome}",
            "start": f"{ag.data_agendamento.isoformat()}T{ag.horario_inicio.isoformat()}",
            "end": f"{ag.data_agendamento.isoformat()}T{ag.horario_fim.isoformat()}" if ag.horario_fim else None,
            "tipo": "cirurgia",
            "extendedProps": {
                "paciente": ag.paciente.nome,
                "procedimento": ag.procedimento.nome,
                "equipe": ag.equipe.nome,
                "local": ag.local_atendimento.nome,
                "valor": ag.valor_geral_venda,
                "status_pagamento": "Pago" if ag.valor_pago >= ag.valor_geral_venda else "Parcial" if ag.valor_pago > 0 else "Pendente",
                "status_cirurgia": ag.status_cirurgia
            }
        })

    # 🔧 Mapeia Sessões para o calendário
    for ag in agendamentos_sessoes:
        eventos.append({
            "id": f"sessao-{ag.id}",
            "title": f"Sessão {ag.numero_sessao}: {ag.paciente.nome} - {ag.pacote_tratamento.descricao}",
            "start": f"{ag.data_agendamento.isoformat()}T{ag.horario_inicio.isoformat()}",
            "end": f"{ag.data_agendamento.isoformat()}T{ag.horario_fim.isoformat()}" if ag.horario_fim else None,
            "tipo": "sessao",
            "extendedProps": {
                "paciente": ag.paciente.nome,
                "pacote": ag.pacote_tratamento.descricao,
                "local": ag.local_atendimento.nome,
                "numero_sessao": ag.numero_sessao,
                "status_sessao": ag.status_sessao
            }
        })

    return jsonify(eventos), 200
