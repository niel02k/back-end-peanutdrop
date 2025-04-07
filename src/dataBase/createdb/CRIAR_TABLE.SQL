CREATE TABLE USUARIOS (
    usu_id INT PRIMARY KEY AUTO_INCREMENT,
    usu_tipo_usuario tinyint NOT NULL,
    usu_nome VARCHAR(255) NOT NULL,
    usu_documento VARCHAR(20) UNIQUE NOT NULL,
    usu_email VARCHAR(255) UNIQUE NOT NULL,
    usu_senha VARCHAR(255) NOT NULL,
    usu_endereco VARCHAR(255),
    usu_telefone VARCHAR(12),
    usu_data_cadastro DATE
);

CREATE TABLE EMPRESAS (
    emp_id INT PRIMARY KEY AUTO_INCREMENT,
    emp_razao_social VARCHAR(255) NOT NULL,
    emp_nome_fantasia VARCHAR(255) NOT NULL,
    emp_tipo_atividade VARCHAR(255),
    emp_telefone VARCHAR(12),
    emp_email VARCHAR(255) UNIQUE NOT NULL
);


CREATE TABLE CERTIFICACOES (
    cert_id INT PRIMARY KEY AUTO_INCREMENT,
    cert_orgao_regulador VARCHAR(255) NOT NULL,
    cert_nome VARCHAR(255) NOT NULL
);



CREATE TABLE AMENDOINS (
    amen_id INT PRIMARY KEY AUTO_INCREMENT,
    amen_variedade VARCHAR(255) NOT NULL,
    amen_tamanho VARCHAR(255),
    amen_outras_caracteristicas VARCHAR (255)
);

CREATE TABLE AGRICULTORES (
    agri_id INT PRIMARY KEY AUTO_INCREMENT,
    agri_localizacao_propriedade VARCHAR (255),
    agri_tipos_amendoim_cultivados VARCHAR (255),
    agri_certificacoes VARCHAR (255),
    agri_outras_informacoes VARCHAR (255)
);

CREATE TABLE RASTREAMENTO_PRODUCAO (
    rast_id INT PRIMARY KEY AUTO_INCREMENT,
    agri_id INT NOT NULL,
    amen_id INT NOT NULL,
    rast_data_plantacao DATE,
    rast_data_colheita DATE,
    rast_informacoes_adicionais VARCHAR(255),
    rast_area_plantacao DECIMAL(10,2),
    FOREIGN KEY (agri_id) REFERENCES AGRICULTORES(agri_id),
    FOREIGN KEY (amen_id) REFERENCES AMENDOINS(amen_id)
);

CREATE TABLE DEMANDAS (
    demanda_id INT PRIMARY KEY AUTO_INCREMENT,
    emp_id INT NOT NULL,
    amen_id INT NOT NULL,
    demanda_quantidade INT,
    demanda_preco_maximo DECIMAL(7,2),
    demanda_data_entrega DATE,
    demanda_outras_informacoes VARCHAR (255),
    demanda_data_publicacao DATE,
    demanda_ativa BIT,
    FOREIGN KEY (emp_id) REFERENCES EMPRESAS(emp_id),
    FOREIGN KEY (amen_id) REFERENCES AMENDOINS(amen_id)
);

CREATE TABLE AGR_CERTIFICACOES (
    agr_cert_id INT PRIMARY KEY AUTO_INCREMENT,
    agri_id INT NOT NULL,
    cert_id INT NOT NULL,
    agr_local VARCHAR(255),
    agr_data DATE,
    agr_arquivo VARCHAR (255),
    agr_status TINYINT,
    FOREIGN KEY (agri_id) REFERENCES AGRICULTORES(agri_id),
    FOREIGN KEY (cert_id) REFERENCES CERTIFICACOES(cert_id)
);

CREATE TABLE OFERTAS (
    oferta_id INT PRIMARY KEY AUTO_INCREMENT,
    agri_id INT NOT NULL,
    amen_id INT NOT NULL,
    oferta_quantidade INT,
    oferta_preco DECIMAL(7,2),
    oferta_data_colheita DATE,
    oferta_outras_informacoes VARCHAR(255),
    oferta_data_publicacao DATE,
    oferta_ativa BIT,
    FOREIGN KEY (agri_id) REFERENCES AGRICULTORES(agri_id),
    FOREIGN KEY (amen_id) REFERENCES AMENDOINS(amen_id)
);

CREATE TABLE NEGOCIACOES (
    negoc_id INT PRIMARY KEY AUTO_INCREMENT,
    oferta_id INT NOT NULL,
    demanda_id INT NOT NULL,
    negoc_status TINYINT,
    FOREIGN KEY (oferta_id) REFERENCES OFERTAS(oferta_id),
    FOREIGN KEY (demanda_id) REFERENCES DEMANDAS(demanda_id)
);

CREATE TABLE PROPOSTA (
    prop_id INT PRIMARY KEY AUTO_INCREMENT,
    negoc_id INT NOT NULL,
    emp_id INT NOT NULL,
    prop_preco DECIMAL(7,2),
    prop_quantidade INT,
    prop_data_envio DATE,
    prop_status TINYINT,
    FOREIGN KEY (negoc_id) REFERENCES NEGOCIACOES(negoc_id),
    FOREIGN KEY (emp_id) REFERENCES EMPRESAS(emp_id)
);

CREATE TABLE MENSAGENS (
    menegoc_id INT NOT NULL,
    id_usuario_remetente INT NOT NULL,
    mens_conteudo VARCHAR(255),
    mens_data_envio DATE,
    mens_visualizada BIT,
    FOREIGN KEY (negoc_id) REFERENCES NEGOCIACOES(negoc_id),
    FOREIGN KEY (id_usuario_remetente) REFERENCES USUARIOS(usu_id)
);

CREATE TABLE CONTRATOS (
    contrato_id INT PRIMARY KEY AUTO_INCREMENT,
    id_negociacao INT NOT NULL,
    contrato_data_assinatura DATE,
    contrato_detalhes_contrato VARCHAR (255),
    FOREIGN KEY (id_negociacao) REFERENCES NEGOCIACOES(negoc_id)
);

CREATE TABLE PAGAMENTOS (
    pag_id INT PRIMARY KEY AUTO_INCREMENT,
    contrato_id INT NOT NULL,
    pag_valor DECIMAL(10,2),
    pag_data_pagamento DATE,
    pag_status TINYINT,
    FOREIGN KEY (contrato_id) REFERENCES CONTRATOS(contrato_id)
);

CREATE TABLE NOTAS_FISCAIS (
    nota_fiscal_id INT PRIMARY KEY AUTO_INCREMENT,
    contrato_id INT NOT NULL,
    nota_fiscal_numero VARCHAR(64) NOT NULL,
    nota_fiscal_data_emissao DATE,
    nota_fiscal_detalhes VARCHAR(255),
   s_id INT PRIMARY KEY AUTO_INCREMENT,
    n FOREIGN KEY (contrato_id) REFERENCES CONTRATOS(contrato_id)
);