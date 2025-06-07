from datetime import datetime
from src.models.paciente import db

class Agendamento(db.Model):
    __tablename__ = 'agendamentos'

    id = db.Column(db.Integer, primary_key=True)
    paciente_id = db.Column(db.Integer, db.ForeignKey('pacientes.id'), nullable=False)
    data = db.Column(db.Date, nullable=False)
    procedimento_id = db.Column(db.Integer, db.ForeignKey('procedimentos.id'), nullable=False)
    grau_calvicie = db.Column(db.String(50), nullable=True)
    equipe_id = db.Column(db.Integer, db.ForeignKey('equipes.id'), nullable=False)
    local_id = db.Column(db.Integer, db.ForeignKey('locais_atendimento.id'), nullable=False)
    horario_inicio = db.Column(db.Time, nullable=True)
    categoria_id = db.Column(db.Integer, db.ForeignKey('categorias_procedimento.id'), nullable=True)
    valor_geral = db.Column(db.Numeric(10, 2), nullable=True)
    valor_pago = db.Column(db.Numeric(10, 2), nullable=True)
    saldo_vendedor = db.Column(db.Numeric(10, 2), nullable=True)
    forma_pagamento = db.Column(db.String(100), nullable=True)
    contrato_id = db.Column(db.Integer, db.ForeignKey('contratos.id'), nullable=True)
    contrato_assinado = db.Column(db.Boolean, default=False)
    exames = db.Column(db.Boolean, default=False)
    comunicacao_d7 = db.Column(db.Boolean, default=False)
    comunicacao_d2 = db.Column(db.Boolean, default=False)
    almoco_id = db.Column(db.Integer, db.ForeignKey('refeicoes.id'), nullable=True)
    termo_marcacao = db.Column(db.Boolean, default=False)
    termo_alta = db.Column(db.Boolean, default=False)
    comunicacao_d1 = db.Column(db.Boolean, default=False)
    observacoes = db.Column(db.Text, nullable=True)
    acompanhante = db.Column(db.String(100), nullable=True)
    telefone_acompanhante = db.Column(db.String(20), nullable=True)

    paciente = db.relationship('Paciente', backref='agendamentos')
    procedimento = db.relationship('Procedimento', backref='agendamentos')
    equipe = db.relationship('Equipe', backref='agendamentos')
    local = db.relationship('LocalAtendimento', backref='agendamentos')
    categoria = db.relationship('CategoriaProcedimento', backref='agendamentos')
    contrato = db.relationship('Contrato', backref='agendamentos')
    almoco = db.relationship('Refeicao', backref='agendamentos')
