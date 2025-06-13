from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from datetime import datetime
from src.models.paciente import db
from src.models.entrada_estoque import EntradaEstoque
from src.models.item_entrada_estoque import ItemEntradaEstoque
from src.models.itens import Item

entradas_estoque_bp = Blueprint("entradas_estoque", __name__)

@entradas_estoque_bp.route("/", methods=["GET"])
@jwt_required()
def listar_entradas_estoque():
    entradas = EntradaEstoque.query.all()
    resultado = []

    for entrada in entradas:
        resultado.append({
            "id": entrada.id,
            "fornecedor_id": entrada.fornecedor_id,
            "fornecedor": entrada.fornecedor.nome,
            "data_entrada": entrada.data_entrada.isoformat(),
            "observacoes": entrada.observacoes,
            "itens": [
                {
                    "id": item.id,
                    "item_id": item.item_id,
                    "nome_item": item.item.nome,
                    "quantidade": item.quantidade,
                    "preco_unitario": item.preco_unitario
                } for item in entrada.itens
            ]
        })
    return jsonify(resultado), 200

@entradas_estoque_bp.route("/", methods=["POST"])
@jwt_required()
def criar_entrada_estoque():
    print(request)
    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400
    
    data = request.get_json()
    fornecedor_id = data.get("fornecedor_id")
    observacoes = data.get("observacoes")
    data_entrada = data.get("data_entrada")
    itens = data.get("itens", [])

    if not fornecedor_id or not data_entrada or not itens:
        return jsonify({"msg": "Campos obrigatórios: fornecedor, data_entrada, itens"}), 400
    
    nova_entrada = EntradaEstoque(
        fornecedor_id=fornecedor_id,
        observacoes=observacoes,
        data_entrada=datetime.strptime(data_entrada, "%Y-%m-%d")
    )
    db.session.add(nova_entrada)
    db.session.flush()  # para obter ID

    for item in itens:
        item_id = item.get("item_id")
        quantidade = item.get("quantidade")
        preco_unitario = item.get("valor_unitario", 0)

        if not item_id or not quantidade:
            continue

        entrada_item = ItemEntradaEstoque(
            entrada_estoque_id=nova_entrada.id,
            item_id=item_id,
            quantidade=quantidade,
            preco_unitario=preco_unitario
        )
        db.session.add(entrada_item)

    db.session.commit()

    return jsonify({"msg": "Entrada de estoque registrada com sucesso", "id": nova_entrada.id}), 201

@entradas_estoque_bp.route("/<int:id>", methods=["DELETE"])
@jwt_required()
def deletar_entrada_estoque(id):
    entrada = EntradaEstoque.query.get(id)
    if not entrada:
        return jsonify({"msg": "Entrada não encontrada"}), 404

    db.session.delete(entrada)
    db.session.commit()

    return jsonify({"msg": "Entrada de estoque deletada com sucesso"}), 200

@entradas_estoque_bp.route("/<int:id>", methods=["GET"])
@jwt_required()
def obter_entrada_estoque(id):
    entrada = EntradaEstoque.query.get_or_404(id)

    resultado = {
        "id": entrada.id,
        "fornecedor_id": entrada.fornecedor_id,
        "data_entrada": entrada.data_entrada.strftime("%Y-%m-%d"),
        "observacoes": entrada.observacoes,
        "itens": [{
            "id": item.id,
            "item_id": item.item_id,
            "nome_item": item.item.nome,
            "quantidade": item.quantidade,
            "preco_unitario": item.preco_unitario
        } for item in entrada.itens]
    }

    return jsonify(resultado), 200

@entradas_estoque_bp.route("/<int:id>", methods=["PUT"])
@jwt_required()
def atualizar_entrada_estoque(id):
    entrada = EntradaEstoque.query.get_or_404(id)

    if not request.is_json:
        return jsonify({"msg": "Requisição deve ser JSON"}), 400

    data = request.get_json()
    fornecedor_id = data.get("fornecedor_id")
    observacoes = data.get("observacoes")
    data_entrada = data.get("data_entrada")
    itens = data.get("itens", [])

    if not fornecedor_id or not data_entrada or not itens:
        return jsonify({"msg": "Campos obrigatórios: fornecedor_id, data_entrada, itens"}), 400

    # Atualiza dados da entrada
    entrada.fornecedor_id = fornecedor_id
    entrada.observacoes = observacoes
    entrada.data_entrada = datetime.strptime(data_entrada, "%Y-%m-%d")

    # Remove os itens antigos
    ItemEntradaEstoque.query.filter_by(entrada_estoque_id=entrada.id).delete()

    # Adiciona os itens novos
    for item in itens:
        item_id = item.get("item_id")
        quantidade = item.get("quantidade")
        preco_unitario = item.get("valor_unitario", 0)

        if not item_id or not quantidade:
            continue

        novo_item = ItemEntradaEstoque(
            entrada_estoque_id=entrada.id,
            item_id=item_id,
            quantidade=quantidade,
            preco_unitario=preco_unitario
        )
        db.session.add(novo_item)

    db.session.commit()

    return jsonify({"msg": "Entrada de estoque atualizada com sucesso"}), 200
