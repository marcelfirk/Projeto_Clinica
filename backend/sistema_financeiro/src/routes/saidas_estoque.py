from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from datetime import datetime
from src.models.paciente import db
from src.models.saida_estoque import SaidaEstoque
from src.models.item_saida_estoque import ItemSaidaEstoque
from src.models.itens import Item
from src.models.agendamento import Agendamento

saidas_estoque_bp = Blueprint("saidas_estoque", __name__)

@saidas_estoque_bp.route("/", methods=["GET"])
@jwt_required()
def listar_saidas_estoque():
    saidas = SaidaEstoque.query.all()
    resultado = []

    for saida in saidas:
        resultado.append({
            "id": saida.id,
            "agendamento_id": saida.agendamento_id,
            "agendamento_dados": saida.agendamento.procedimento.nome + ' - ' + saida.agendamento.paciente.nome ,
            "data_saida": saida.data_saida.isoformat(),
            "observacoes": saida.observacoes,
            "itens": [
                {
                    "id": item.id,
                    "item_id": item.item_id,
                    "nome_item": item.item.nome,
                    "quantidade": item.quantidade
                } for item in saida.itens_saida
            ]
        })
    
    return jsonify(resultado), 200

@saidas_estoque_bp.route("/", methods=["POST"])
@jwt_required()
def registrar_saida_estoque():
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    
    data = request.get_json()
    agendamento_id = data.get("agendamento_id")
    observacoes = data.get("observacoes")
    data_saida = data.get("data_saida")
    itens = data.get("itens", [])

    if not agendamento_id or not data_saida or not itens:
        return jsonify({"msg": "Campos obrigatórios: agendamento_id, data_saida, itens"}), 400

    nova_saida = SaidaEstoque(
        agendamento_id=agendamento_id,
        observacoes=observacoes,
        data_saida=datetime.strptime(data_saida, "%Y-%m-%d")
    )
    db.session.add(nova_saida)
    db.session.flush()  # garante o ID

    for item in itens:
        item_id = item.get("item_id")
        quantidade = item.get("quantidade")

        if not item_id or not quantidade:
            continue

        saida_item = ItemSaidaEstoque(
            saida_estoque_id=nova_saida.id,
            item_id=item_id,
            quantidade=quantidade
        )
        db.session.add(saida_item)

    db.session.commit()

    return jsonify({"msg": "Saída de estoque registrada com sucesso", "id": nova_saida.id}), 201

@saidas_estoque_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def deletar_saida_estoque(id):
    saida = SaidaEstoque.query.get(id)
    if not saida:
        return jsonify({"msg": "Saída de estoque não encontrada"}), 404

    db.session.delete(saida)
    db.session.commit()

    return jsonify({"msg": "Saída de estoque deletada com sucesso"}), 200
