from src.models.paciente import db

class CategoriaProcedimento(db.Model):
    __tablename__ = 'categorias_procedimento'

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)