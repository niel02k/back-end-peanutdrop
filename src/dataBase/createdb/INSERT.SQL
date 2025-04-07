-- Inserindo usuários (1 ADM, 3 agricultores, 3 empresas)
INSERT INTO USUARIOS (usu_tipo_usuario, usu_nome, usu_documento, usu_email, usu_senha, usu_endereco, usu_telefone, usu_data_cadastro) VALUES
(1, 'João Silva', '12345678900', 'joao@email.com', 'senha123', 'Rua A, 123', '11987654321', '2025-03-17'),
(2, 'Carlos Oliveira', '23456789012', 'carlos@email.com', 'senha456', 'Fazenda Boa Vista', '11988887777', '2025-03-15'),
(2, 'Ana Mendes', '34567890123', 'ana@email.com', 'senha789', 'Sítio Harmonia', '11977776666', '2025-03-16'),
(2, 'Marcos Silva', '45678901234', 'marcos@email.com', 'senha000', 'Chácara Bela', '11966665555', '2025-03-18'),
(3, 'Empresa Exemplo Ltda', '56789012345', 'empresa1@email.com', 'senha111', 'Av. Comercial, 100', '1133224455', '2025-03-14'),
(3, 'AgroNutri SA', '67890123456', 'empresa2@email.com', 'senha222', 'Rua Industrial, 200', '1144335566', '2025-03-12'),
(3, 'NutriFoods Ltda', '78901234567', 'empresa3@email.com', 'senha333', 'Estrada do Comércio, 300', '1155446677', '2025-03-11');

-- Inserindo empresas (3 empresas)
INSERT INTO EMPRESAS (emp_razao_social, emp_nome_fantasia, emp_tipo_atividade, emp_telefone, emp_email) VALUES
('Empresa Exemplo Ltda', 'Exemplo', 'Comércio', '1133224455', 'contato@exemplo.com'),
('AgroNutri SA', 'AgroNutri', 'Indústria alimentícia', '1144335566', 'contato@agronutri.com'),
('NutriFoods Ltda', 'NutriFoods', 'Distribuição', '1155446677', 'contato@nutrifoods.com');

-- Inserindo certificações (5 certificações)
INSERT INTO CERTIFICACOES (cert_orgao_regulador, cert_nome) VALUES
('MAPA', 'Certificação de Qualidade'),
('ANVISA', 'Boas Práticas de Fabricação'),
('ISO', 'ISO 22000'),
('Orgânicos Brasil', 'Selo Orgânico'),
('FDA', 'Certificado de Exportação');

-- Inserindo tipos de amendoim (5 tipos)
INSERT INTO AMENDOINS (amen_variedade, amen_tamanho, amen_outras_caracteristicas) VALUES
('Runner', 'Grande', 'Alto teor de óleo'),
('Valência', 'Pequeno', 'Sabor adocicado'),
('Virginia', 'Médio', 'Boa produtividade'),
('Español', 'Pequeno', 'Casca fina'),
('Florunner', 'Grande', 'Resistente a pragas');

-- Inserindo agricultores (3 agricultores)
INSERT INTO AGRICULTORES (agri_localizacao_propriedade, agri_tipos_amendoim_cultivados, agri_certificacoes, agri_outras_informacoes) VALUES
('Fazenda São José', 'Runner, Virginia', 'Certificação de Qualidade, Selo Orgânico', 'Solo argiloso'),
('Sítio Boa Esperança', 'Valência, Español', 'Boas Práticas de Fabricação', 'Cultivo orgânico'),
('Chácara Bela Vista', 'Florunner', 'ISO 22000', 'Sistema de irrigação moderno');

-- Inserindo rastreamento de produção (4 registros por agricultor)
INSERT INTO RASTREAMENTO_PRODUCAO (agri_id, amen_id, rast_data_plantacao, rast_data_colheita, rast_informacoes_adicionais, rast_area_plantacao) VALUES
(1, 1, '2024-09-01', '2025-01-15', 'Clima favorável', 50.5),
(1, 3, '2024-08-05', '2025-02-10', 'Boa produtividade', 40.0),
(1, 5, '2024-07-15', '2025-01-30', 'Poucas pragas', 30.0),
(1, 2, '2024-10-01', '2025-03-01', 'Ótimo desenvolvimento', 25.0),
(2, 2, '2024-08-10', '2024-12-20', 'Baixa incidência de pragas', 30.0),
(2, 4, '2024-07-20', '2025-01-25', 'Solo fértil', 20.5),
(2, 1, '2024-06-15', '2025-01-10', 'Produção orgânica', 35.0),
(2, 3, '2024-11-05', '2025-03-20', 'Alta resistência', 28.0),
(3, 5, '2024-09-25', '2025-02-15', 'Colheita antecipada', 45.0),
(3, 4, '2024-07-30', '2025-01-05', 'Testando novo fertilizante', 38.0),
(3, 1, '2024-10-10', '2025-03-05', 'Nova variedade plantada', 50.0),
(3, 2, '2024-06-25', '2025-02-28', 'Sistema de irrigação novo', 42.0);

-- Inserindo certificações para agricultores (1 sem certificação, 1 com 2 certificações, 1 com 1 certificação)
INSERT INTO AGR_CERTIFICACOES (agri_id, cert_id, agr_local, agr_data, agr_arquivo, agr_status) VALUES
(1, 1, 'Fazenda São José', '2024-06-01', 'certificado1.pdf', 1),
(1, 4, 'Fazenda São José', '2024-06-10', 'certificado2.pdf', 1),
(2, 2, 'Sítio Boa Esperança', '2024-06-15', 'certificado3.pdf', 1),
(3, 3, NULL, NULL, NULL, NULL); -- Sem certificação

-- Inserindo demandas (3 demandas)
INSERT INTO DEMANDAS (emp_id, amen_id, demanda_quantidade, demanda_preco_maximo, demanda_data_entrega, demanda_outras_informacoes, demanda_data_publicacao, demanda_ativa) VALUES
(1, 1, 1000, 5.50, '2025-04-10', 'Entrega no Porto de Santos', '2025-03-15', 1),
(2, 2, 1500, 6.00, '2025-04-20', 'Necessário embalagem a vácuo', '2025-03-16', 1),
(3, 3, 2000, 5.80, '2025-05-05', 'Frete incluso', '2025-03-17', 1);

-- Inserindo ofertas (2 ofertas)
INSERT INTO OFERTAS (agri_id, amen_id, oferta_quantidade, oferta_preco, oferta_data_colheita, oferta_outras_informacoes, oferta_data_publicacao, oferta_ativa) VALUES
(1, 1, 1200, 5.20, '2025-01-15', 'Produção sem pesticidas', '2025-03-10', 1),
(2, 2, 600, 5.80, '2024-12-20', 'Amendoim de alta qualidade', '2025-03-12', 1);

-- Inserindo negociações (2 negociações)
INSERT INTO NEGOCIACOES (oferta_id, demanda_id, negoc_status) VALUES
(1, 1, 1),
(2, 2, 1);

-- Inserindo propostas (2 propostas)
INSERT INTO PROPOSTA (negoc_id, emp_id, prop_preco, prop_quantidade, prop_data_envio, prop_status) VALUES
(1, 1, 5.30, 1000, '2025-03-18', 1),
(2, 2, 5.90, 1500, '2025-03-18', 1);

-- Inserindo mensagens (4 mensagens)
INSERT INTO MENSAGENS (negoc_id, id_usuario_remetente, mens_conteudo, mens_data_envio, mens_visualizada) VALUES
(1, 5, 'Estamos interessados na oferta, podemos negociar o preço?', '2025-03-17', 0),
(1, 2, 'Sim, qual seria sua contraproposta?', '2025-03-17', 1),
(2, 6, 'A empresa precisa de uma entrega rápida, é possível antecipar?', '2025-03-17', 0),
(2, 3, 'Podemos antecipar em 5 dias, isso ajudaria?', '2025-03-18', 1);

-- Inserindo contratos (2 contratos)
INSERT INTO CONTRATOS (id_negociacao, contrato_data_assinatura, contrato_detalhes_contrato) VALUES
(1, '2025-03-19', 'Contrato firmado com pagamento antecipado'),
(2, '2025-03-19', 'Contrato com parcelamento em 2x');

-- Inserindo pagamentos (2 pagamentos)
INSERT INTO PAGAMENTOS (contrato_id, pag_valor, pag_data_pagamento, pag_status) VALUES
(1, 5300.00, '2025-04-01', 1),
(2, 8850.00, '2025-04-10', 1);

-- Inserindo notas fiscais (2 notas fiscais)
INSERT INTO NOTAS_FISCAIS (contrato_id, nota_fiscal_numero, nota_fiscal_data_emissao, nota_fiscal_detalhes) VALUES
(1, 'NF123456', '2025-04-02', 'Venda de amendoim para empresa Exemplo'),
(2, 'NF654321', '2025-04-11', 'Venda parcelada de amendoim para AgroNutri SA');

-- Adicionei mais registros conforme necessário para bater com os números indicados nos comentários.
