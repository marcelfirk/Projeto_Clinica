from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from src.models.paciente import db

class Agendamento(db.Model):
    __tablename__ = 'agendamentos'
    
    id = db.Column(db.Integer, primary_key=True)
    paciente_id = db.Column(db.Integer, db.ForeignKey('pacientes.id'), nullable=False)
    data_agendamento = db.Column(db.Date, nullable=False)
    procedimento_id = db.Column(db.Integer, db.ForeignKey('procedimentos.id'), nullable=False)
    grau_calvicie = db.Column(db.String(50), nullable=True)
    equipe_id = db.Column(db.Integer, db.ForeignKey('equipes.id'), nullable=False)
    local_atendimento_id = db.Column(db.Integer, db.ForeignKey('locais_atendimento.id'), nullable=False)
    horario_inicio = db.Column(db.Time, nullable=False)
    categoria_id = db.Column(db.Integer, db.ForeignKey('categorias_procedimento.id'), nullable=False)
    valor_geral_venda = db.Column(db.Float, nullable=True)
    valor_pago = db.Column(db.Float, default=0.0)
    saldo_devedor = db.Column(db.Float, default=0.0)
    forma_pagamento = db.Column(db.String(100), nullable=True)
    contrato_assinado = db.Column(db.Boolean, default=False)
    exames = db.Column(db.Boolean, default=False)
    comunicacao_d7 = db.Column(db.Boolean, default=False)
    comunicacao_d2 = db.Column(db.Boolean, default=False)
    almoco_escolhido_id = db.Column(db.Integer, db.ForeignKey('refeicoes.id'), nullable=True)
    termo_marcacao = db.Column(db.Boolean, default=False)
    termo_alta = db.Column(db.Boolean, default=False)
    comunicacao_d1 = db.Column(db.Boolean, default=False)
    observacoes = db.Column(db.Text, nullable=True)
    acompanhante = db.Column(db.String(100), nullable=True)
    telefone_acompanhante = db.Column(db.String(20), nullable=True)
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)

    paciente = db.relationship('Paciente', backref='agendamentos_paciente', lazy=True)
    procedimento = db.relationship('Procedimento', backref='agendamentos_procedimento', lazy=True)
    equipe = db.relationship('Equipe', backref='agendamentos_equipe', lazy=True)
    local_atendimento = db.relationship('LocalAtendimento', backref='agendamentos_local', lazy=True)
    categoria = db.relationship('CategoriaProcedimento', backref='agendamentos_categoria', lazy=True)
    almoco_escolhido = db.relationship('Refeicao', backref='agendamentos_almoco', lazy=True)
    

    def __repr__(self):
        return f'<Agendamento {self.id} - {self.data_agendamento}>'