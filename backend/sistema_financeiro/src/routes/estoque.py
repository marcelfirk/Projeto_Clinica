from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from src.models.paciente import db
from src.models.itens import Item
from src.models.item_entrada_estoque import ItemEntradaEstoque
from src.models.item_saida_estoque import ItemSaidaEstoque
from sqlalchemy import func

estoque_bp = Blueprint("estoque", __name__)

@estoque_bp.route("/", methods=["GET"])
@jwt_required()
def obter_estoque_atual():
    # Soma das entradas por item
    entradas = db.session.query(
        ItemEntradaEstoque.item_id,
        func.coalesce(func.sum(ItemEntradaEstoque.quantidade), 0).label("total_entrada")
    ).group_by(ItemEntradaEstoque.item_id).all()

    # Soma das saídas por item
    saidas = db.session.query(
        ItemSaidaEstoque.item_id,
        func.coalesce(func.sum(ItemSaidaEstoque.quantidade), 0).label("total_saida")
    ).group_by(ItemSaidaEstoque.item_id).all()

    # Transformar em dicionários para acesso rápido
    entradas_dict = {item_id: total for item_id, total in entradas}
    saidas_dict = {item_id: total for item_id, total in saidas}

    # Pegar todos os itens e calcular saldo
    itens = Item.query.all()
    resultado = []

    for item in itens:
        total_entrada = entradas_dict.get(item.id, 0)
        total_saida = saidas_dict.get(item.id, 0)
        saldo = total_entrada - total_saida

        resultado.append({
            "item_id": item.id,
            "nome": item.nome,
            "descricao": item.descricao,
            "quantidade_atual": saldo,
            "total_entrada": total_entrada,
            "total_saida": total_saida
        })
    
    return jsonify(resultado), 200
