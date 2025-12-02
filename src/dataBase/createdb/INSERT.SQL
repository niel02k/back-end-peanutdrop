-- Primeiro: Inserir EMPRESAS (não depende de ninguém)
INSERT INTO EMPRESAS (emp_razao_social, emp_nome_fantasia, emp_tipo_atividade, emp_telefone, emp_email, emp_img) VALUES
('Peanut Grenn Ltda', 'PeanutGrenn', 'Comércio', '1133224455', 'contato@exemplo.com', 'empresas1.jpg'),
('AgroNutri SA', 'AgroNutri', 'Indústria alimentícia', '1144335566', 'contato@agronutri.com','empresas2.jpg'),
('NutriFoods Ltda', 'NutriFoods', 'Distribuição', '1155446677', 'contato@nutrifoods.com','empresas3.jpg'),
('Amendoim Brasil Ltda', 'AmendoimBrasil', 'Exportação', '1166667777', 'contato@amendobrasil.com', 'empresas4.jpg'),
('Food Quality SA', 'FoodQuality', 'Controle de Qualidade', '1177778888', 'qualidade@foodquality.com', 'empresas5.jpg'),
('AgroExport Trading', 'AgroExport', 'Comércio Exterior', '1188889999', 'export@agroexport.com', 'empresas6.jpg'),
('NutriPeanut Indústria', 'NutriPeanut', 'Processamento', '1199990000', 'vendas@nutripeanut.com', 'empresas7.jpg'),
('Cereal Market Ltda', 'CerealMarket', 'Atacado', '1100001111', 'contato@cerealmarket.com', 'empresas8.jpg'),
('Organic Foods Brasil', 'OrganicFoods', 'Produtos Orgânicos', '1111112222', 'organic@organicfoods.com', 'empresas9.jpg'),
('Global Nuts Export', 'GlobalNuts', 'Exportação Premium', '1122223333', 'global@globalnuts.com', 'empresas10.jpg');

-- Segundo: Inserir AGRICULTORES (não depende de ninguém)
INSERT INTO AGRICULTORES (agri_nome, agri_localizacao_propriedade, agri_tipos_amendoim_cultivados, agri_certificacoes, agri_outras_informacoes, agri_telefone, agri_email, agri_img) VALUES
('João da Silva', 'Fazenda São José', 'Runner, Virginia', 'Certificação de Qualidade, Selo Orgânico', 'Solo argiloso', '11999998888', 'joao.silva@email.com', 'agricultor1.jpg'),
('Maria Oliveira', 'Sítio Boa Esperança', 'Valência, Español', 'Boas Práticas de Fabricação', 'Cultivo orgânico', '11988887777', 'maria.oliveira@email.com', 'agricultor2.jpg'),
('Carlos Santos', 'Chácara Bela Vista', 'Florunner', 'ISO 22000', 'Sistema de irrigação moderno', '11977776666', 'carlos.santos@email.com', 'agricultor3.jpg'),
('Pedro Henrique', 'Fazenda Nova Esperança', 'Tatu, Ouro Verde', 'Comércio Justo', 'Produção familiar', '11966665555', 'pedro.henrique@email.com', 'agricultor4.jpg'),
('Fernanda Costa', 'Sítio Recanto Feliz', 'IAC 886, Granoleico', 'Agricultura Regenerativa', 'Cultivo sustentável', '11955554444', 'fernanda.costa@email.com', 'agricultor5.jpg'),
('Roberto Almeida', 'Chácara São Francisco', 'BRS Havana, Runner', 'Certifica Minas', 'Tecnologia de ponta', '11944443333', 'roberto.almeida@email.com', 'agricultor6.jpg'),
('Juliana Martins', 'Fazenda Boa Colheita', 'Virginia, Valência', 'GlobalG.A.P.', 'Produção integrada', '11933332222', 'juliana.martins@email.com', 'agricultor7.jpg'),
('Lucas Pereira', 'Sítio Cachoeira', 'Español, Florunner', 'IBD Orgânico', 'Métodos naturais', '11922221111', 'lucas.pereira@email.com', 'agricultor8.jpg'),
('Sandra Nunes', 'Fazenda Santa Rita', 'Tatu, Virginia', 'Fair Trade', 'Comércio justo', '11911110000', 'sandra.nunes@email.com', 'agricultor9.jpg'),
('Antônio Carlos', 'Chácara Vale Verde', 'Ouro Verde, BRS Havana', 'Multiple certificações', 'Produção diversificada', '11900009999', 'antonio.carlos@email.com', 'agricultor10.jpg');

-- Terceiro: Inserir USUARIOS (depende de AGRICULTORES e EMPRESAS)
INSERT INTO USUARIOS (usu_tipo_usuario, usu_nome, usu_documento, usu_email, usu_senha, usu_endereco, usu_telefone, usu_data_cadastro, usu_imagem, agri_id, emp_id, usu_cep, usu_cidade, usu_estado) VALUES
-- Administrador (não vinculado a agricultor ou empresa)
(1, 'Admin Sistema', '01234567890', 'admin@sistema.com', 'admin123', 'Sede Administrativa', '11900001111', '2025-03-24', 'usuario10.jpg', NULL, NULL, '01234-567', 'São Paulo', 'SP'),

-- Agricultores (vinculados aos agricultores)
(2, 'João Silva', '12345678900', 'joao@email.com', 'senha123', 'Rua A, 123', '11987654321', '2025-03-17', 'usuario1.jpg', 1, NULL, '12345-678', 'Ribeirão Preto', 'SP'),
(2, 'Carlos Oliveira', '23456789012', 'carlos@email.com', 'senha456', 'Fazenda Boa Vista', '11988887777', '2025-03-15', 'usuario2.jpg', 2, NULL, '23456-789', 'Campinas', 'SP'),
(2, 'Ana Mendes', '34567890123', 'ana@email.com', 'senha789', 'Sítio Harmonia', '11977776666', '2025-03-16', 'usuario3.jpg', 3, NULL, '34567-890', 'Piracicaba', 'SP'),
(2, 'Pedro Santos', '45678901234', 'pedro@email.com', 'senha101', 'Fazenda Esperança', '11966665555', '2025-03-18', 'usuario4.jpg', 4, NULL, '45678-901', 'Bauru', 'SP'),
(2, 'Mariana Lima', '56789012345', 'mariana@email.com', 'senha102', 'Sítio Verde', '11955554444', '2025-03-19', 'usuario5.jpg', 5, NULL, '56789-012', 'São Carlos', 'SP'),
(2, 'Ricardo Alves', '67890123456', 'ricardo@email.com', 'senha103', 'Chácara São Pedro', '11944443333', '2025-03-20', 'usuario6.jpg', 6, NULL, '67890-123', 'Araraquara', 'SP'),

-- Empresas (vinculadas às empresas)
(3, 'Amanda Costa', '78901234567', 'amanda@email.com', 'senha104', 'Rua B, 456', '11933332222', '2025-03-21', 'usuario7.jpg', NULL, 1, '78901-234', 'São Paulo', 'SP'),
(3, 'Bruno Oliveira', '89012345678', 'bruno@email.com', 'senha105', 'Av. Central, 789', '11922221111', '2025-03-22', 'usuario8.jpg', NULL, 2, '89012-345', 'Campinas', 'SP'),
(3, 'Carla Silva', '90123456789', 'carla@email.com', 'senha106', 'Rua C, 321', '11911110000', '2025-03-23', 'usuario9.jpg', NULL, 3, '90123-456', 'Ribeirão Preto', 'SP');

-- Quarto: Inserir CERTIFICACOES (não depende de ninguém)
INSERT INTO CERTIFICACOES (cert_orgao_regulador, cert_nome) VALUES
('MAPA', 'Certificação de Qualidade'),
('ANVISA', 'Boas Práticas de Fabricação'),
('ISO', 'ISO 22000'),
('Orgânicos Brasil', 'Selo Orgânico'),
('FDA', 'Certificado de Exportação'),
('IBD', 'Certificação Orgânica'),
('Fair Trade', 'Comércio Justo'),
('GlobalG.A.P.', 'Boas Práticas Agrícolas'),
('Selo AR', 'Agricultura Regenerativa'),
('Certifica Minas', 'Qualidade MG');

-- Quinto: Inserir AMENDOINS (não depende de ninguém)
INSERT INTO AMENDOINS (amen_variedade, amen_tamanho, amen_outras_caracteristicas) VALUES
('Runner', 'Grande', 'Alto teor de óleo'),
('Valência', 'Pequeno', 'Sabor adocicado'),
('Virginia', 'Médio', 'Boa produtividade'),
('Español', 'Pequeno', 'Casca fina'),
('Florunner', 'Grande', 'Resistente a pragas'),
('Tatu', 'Médio', 'Casca resistente'),
('Ouro Verde', 'Pequeno', 'Alto rendimento'),
('IAC 886', 'Grande', 'Resistente a doenças'),
('Granoleico', 'Médio', 'Alto teor oleico'),
('BRS Havana', 'Pequeno', 'Precoce');

-- Sexto: Inserir RASTREAMENTO_PRODUCAO (depende de AGRICULTORES e AMENDOINS)
INSERT INTO RASTREAMENTO_PRODUCAO (agri_id, amen_id, rast_data_plantacao, rast_data_colheita, rast_informacoes_adicionais, rast_area_plantacao) VALUES
-- Agricultor 1
(1, 1, '2024-09-01', '2025-01-15', 'Clima favorável', 50.5),
(1, 3, '2024-08-05', '2025-02-10', 'Boa produtividade', 40.0),
(1, 5, '2024-07-15', '2025-01-30', 'Poucas pragas', 30.0),
(1, 2, '2024-10-01', '2025-03-01', 'Ótimo desenvolvimento', 25.0),

-- Agricultor 2
(2, 2, '2024-08-10', '2024-12-20', 'Baixa incidência de pragas', 30.0),
(2, 4, '2024-07-20', '2025-01-25', 'Solo fértil', 20.5),
(2, 1, '2024-06-15', '2025-01-10', 'Produção orgânica', 35.0),
(2, 3, '2024-11-05', '2025-03-20', 'Alta resistência', 28.0),

-- Agricultor 3
(3, 5, '2024-09-25', '2025-02-15', 'Colheita antecipada', 45.0),
(3, 4, '2024-07-30', '2025-01-05', 'Testando novo fertilizante', 38.0),
(3, 1, '2024-10-10', '2025-03-05', 'Nova variedade plantada', 50.0),
(3, 2, '2024-06-25', '2025-02-28', 'Sistema de irrigação novo', 42.0),

-- Outros agricultores
(4, 6, '2024-08-15', '2025-01-20', 'Primeira safra na propriedade', 35.0),
(4, 7, '2024-09-10', '2025-02-15', 'Teste de nova variedade', 28.5),
(5, 8, '2024-07-25', '2025-01-10', 'Cultivo orgânico', 42.0),
(5, 9, '2024-10-05', '2025-03-12', 'Alta produtividade', 38.0),
(6, 10, '2024-08-20', '2025-02-05', 'Sistema irrigado', 45.5),
(6, 6, '2024-09-15', '2025-02-28', 'Clima favorável', 32.0),
(7, 7, '2024-07-30', '2025-01-25', 'Manejo integrado', 40.0),
(8, 8, '2024-08-25', '2025-02-10', 'Produção certificada', 36.5);

-- Sétimo: Inserir AGR_CERTIFICACOES (depende de AGRICULTORES e CERTIFICACOES)
INSERT INTO AGR_CERTIFICACOES (agri_id, cert_id, agr_local, agr_data, agr_arquivo, agr_status) VALUES
(1, 1, 'Fazenda São José', '2024-06-01', 'certificado1.pdf', 1),
(1, 4, 'Fazenda São José', '2024-06-10', 'certificado2.pdf', 1),
(2, 2, 'Sítio Boa Esperança', '2024-06-15', 'certificado3.pdf', 1),
(4, 6, 'Fazenda Nova Esperança', '2024-05-20', 'certificado4.pdf', 1),
(5, 7, 'Sítio Recanto Feliz', '2024-06-05', 'certificado5.pdf', 1),
(6, 8, 'Chácara São Francisco', '2024-04-15', 'certificado6.pdf', 1),
(7, 9, 'Fazenda Boa Colheita', '2024-07-10', 'certificado7.pdf', 1),
(8, 10, 'Sítio Cachoeira', '2024-05-25', 'certificado8.pdf', 1),
(9, 6, 'Fazenda Santa Rita', '2024-06-30', 'certificado9.pdf', 1),
(10, 1, 'Chácara Vale Verde', '2024-07-15', 'certificado10.pdf', 1);

-- Oitavo: Inserir DEMANDAS (depende de EMPRESAS e AMENDOINS)
INSERT INTO DEMANDAS 
(emp_id, amen_id, demanda_quantidade, demanda_preco_maximo, demanda_data_entrega, demanda_outras_informacoes, demanda_data_publicacao, demanda_imagem, demanda_ativa) 
VALUES
(1, 1, 50, 200, '2025-11-01', 'Sacas de amendoim cru — preço total por lote', '2025-10-17', 'Demandas1.jpg', 1),
(2, 2, 40, 210, '2025-11-05', 'Saca de amendoim selecionado em casca — lote completo', '2025-10-17', 'Demandas2.jpg', 1),
(3, 3, 30, 220, '2025-11-10', 'Amendoim em casca seca — lote fechado', '2025-10-17', 'Demandas3.jpg', 1),
(4, 4, 60, 230, '2025-11-15', 'Amendoim tipo exportação — valor total', '2025-10-18', 'Demandas4.jpg', 1),
(5, 5, 45, 240, '2025-11-20', 'Para produção de pasta — lote completo', '2025-10-19', 'Demandas5.jpg', 1),
(6, 6, 55, 250, '2025-11-25', 'Grãos selecionados — preço total', '2025-10-20', 'Demandas6.jpg', 1),
(7, 7, 65, 260, '2025-11-30', 'Amendoim orgânico — valor do lote', '2025-10-21', 'Demandas7.jpg', 1),
(8, 8, 70, 270, '2025-12-05', 'Para confeitaria — lote fechado', '2025-10-22', 'Demandas8.jpg', 1),
(9, 9, 75, 280, '2025-12-10', 'Premium qualidade — lote completo', '2025-10-23', 'Demandas9.jpg', 1),
(10, 10, 80, 290, '2025-12-15', 'Exportação Europa — lote total', '2025-10-24', 'Demandas10.jpg', 1);


-- Nono: Inserir OFERTAS (depende de AGRICULTORES e AMENDOINS)
INSERT INTO OFERTAS (agri_id, amen_id, oferta_quantidade, oferta_preco, oferta_data_colheita, oferta_outras_informacoes, oferta_data_publicacao, oferta_ativa, oferta_img) 
VALUES
(1, 1, 1200, 6500, '2025-01-15', 'Produção sem pesticidas', '2025-03-10', 1, 'Ofertas1.jpg'),
(2, 2, 600, 3400, '2024-12-20', 'Amendoim de alta qualidade', '2025-03-12', 1, 'Ofertas2.jpg'),
(3, 3, 800, 4200, '2025-02-20', 'Produção tradicional', '2025-03-14', 1, 'Ofertas3.jpg'),
(4, 4, 1000, 5000, '2025-02-25', 'Cultivo sustentável', '2025-03-15', 1, 'Ofertas4.jpg'),
(5, 5, 1200, 7000, '2025-03-01', 'Orgânico certificado', '2025-03-16', 1, 'Ofertas5.jpg'),
(6, 6, 900, 4800, '2025-03-05', 'Alta qualidade', '2025-03-17', 1, 'Ofertas6.jpg'),
(7, 7, 1100, 6100, '2025-03-10', 'Pré-selecionado', '2025-03-18', 1, 'Ofertas7.jpg'),
(8, 8, 950, 5200, '2025-03-15', 'Para exportação', '2025-03-19', 1, 'Ofertas8.jpg'),
(9, 9, 1300, 7400, '2025-03-20', 'Grãos nobres', '2025-03-20', 1, 'Ofertas9.jpg'),
(10, 10, 1400, 7800, '2025-03-25', 'Premium selection', '2025-03-21', 1, 'Ofertas10.jpg');


-- Décimo: Inserir NEGOCIACOES (depende de OFERTAS e DEMANDAS)
INSERT INTO NEGOCIACOES (oferta_id, demanda_id, agri_id, emp_id, negoc_status, negoc_data_criacao) VALUES
(1, NULL, 1, 3, 1, '2025-04-01 10:30:00'),      -- negoc_id = 1
(2, NULL, 2, 4, 1, '2025-04-02 14:15:00'),      -- negoc_id = 2  
(3, NULL, 3, 5, 2, '2025-04-03 09:45:00'),      -- negoc_id = 3
(4, NULL, 4, 6, 3, '2025-04-04 16:20:00'),      -- negoc_id = 4
(NULL, 1, 5, 7, 1, '2025-04-05 11:10:00'),      -- negoc_id = 5
(NULL, 2, 6, 8, 2, '2025-04-06 13:25:00'),      -- negoc_id = 6
(NULL, 3, 7, 9, 3, '2025-04-07 15:40:00'),      -- negoc_id = 7
(NULL, 4, 8, 10, 4, '2025-04-08 08:55:00'),     -- negoc_id = 8
(5, 5, 9, 3, 5, '2025-04-09 12:30:00'),         -- negoc_id = 9
(6, 6, 10, 4, 6, '2025-04-10 17:05:00');        -- negoc_id = 10

-- Décimo primeiro: Inserir PROPOSTA (depende de NEGOCIACOES e EMPRESAS)
INSERT INTO PROPOSTAS (negoc_id, emp_id, agri_id, prop_preco, prop_quantidade, prop_data_envio, prop_status, prop_observacoes) VALUES
-- Propostas de EMPRESAS para negociações iniciadas por ofertas
(1, 3, NULL, 5.15, 1000, '2025-04-01 11:00:00', 1, 'Interessados na oferta, podemos fechar hoje?'),
(2, 4, NULL, 5.70, 600, '2025-04-02 15:00:00', 1, 'Precisamos de entrega urgente'),
(3, 5, NULL, 5.40, 800, '2025-04-03 10:30:00', 2, 'Proposta aceita pelo agricultor'),

-- Propostas de AGRICULTORES (contrapropostas)
(1, NULL, 1, 5.25, 1000, '2025-04-01 16:00:00', 4, 'Aceito mas com ajuste no preço'),
(4, NULL, 4, 5.65, 1000, '2025-04-04 17:30:00', 1, 'Produção orgânica certificada'),

-- Propostas de EMPRESAS para negociações iniciadas por demandas
(5, 7, NULL, 5.85, 1200, '2025-04-05 12:00:00', 1, 'Atendendo sua demanda'),
(6, 8, NULL, 5.95, 900, '2025-04-06 14:00:00', 2, 'Proposta aprovada'),

-- Propostas finais fechadas
(9, 3, NULL, 5.90, 1200, '2025-04-09 13:00:00', 5, 'Contrato gerado'),
(10, 4, NULL, 6.05, 900, '2025-04-10 18:00:00', 5, 'Negociação concluída');
-- Décimo segundo: Inserir MENSAGENS (depende de NEGOCIACOES e USUARIOS)
INSERT INTO MENSAGENS (id_usuario_remetente, negoc_id, mens_conteudo, mens_data_envio, mens_visualizada) VALUES
(2, 1, 'Estamos interessados na oferta, podemos negociar o preço?', '2025-03-17', 0),
(3, 1, 'Sim, qual seria sua contraproposta?', '2025-03-17', 1),
(4, 2, 'A empresa precisa de uma entrega rápida, é possível antecipar?', '2025-03-17', 0),
(5, 2, 'Podemos antecipar em 5 dias, isso ajudaria?', '2025-03-18', 1),
(6, 3, 'Podemos fechar hoje?', '2025-03-19', 1),
(7, 4, 'Precisamos ajustar quantidade', '2025-03-20', 0),
(8, 5, 'Aceito as condições', '2025-03-21', 1),
(9, 6, 'Vamos revisar o contrato', '2025-03-22', 1),
(2, 7, 'Entrega confirmada', '2025-03-23', 1),
(3, 8, 'Pagamento aprovado', '2025-03-24', 0);

-- Décimo terceiro: Inserir CONTRATOS (depende de NEGOCIACOES)
INSERT INTO CONTRATOS (id_negociacao, contrato_data_assinatura, contrato_detalhes_contrato) VALUES
(1, '2025-03-19', 'Contrato firmado com pagamento antecipado'),
(2, '2025-03-19', 'Contrato com parcelamento em 2x'),
(3, '2025-03-20', 'Contrato padrão com garantia'),
(4, '2025-03-21', 'Contrato especial exportação'),
(5, '2025-03-22', 'Contrato orgânico certificado'),
(6, '2025-03-23', 'Contrato com cláusula qualidade'),
(7, '2025-03-24', 'Contrato premium'),
(8, '2025-03-25', 'Contrato longo prazo'),
(9, '2025-03-26', 'Contrato experimental'),
(10, '2025-03-27', 'Contrato safra 2025');

-- Décimo quarto: Inserir PAGAMENTOS (depende de CONTRATOS)
INSERT INTO PAGAMENTOS (contrato_id, pag_valor, pag_data_pagamento, pag_status) VALUES
(1, 5300.00, '2025-04-01', 1),
(2, 8850.00, '2025-04-10', 1),
(3, 4480.00, '2025-04-05', 1),
(4, 5800.00, '2025-04-12', 1),
(5, 7140.00, '2025-04-15', 2),
(6, 5445.00, '2025-04-18', 1),
(7, 6765.00, '2025-04-20', 1),
(8, 5937.50, '2025-04-22', 2),
(9, 8255.00, '2025-04-25', 1),
(10, 9030.00, '2025-04-28', 1);

-- Décimo quinto: Inserir NOTAS_FISCAIS (depende de CONTRATOS)
INSERT INTO NOTAS_FISCAIS (contrato_id, nota_fiscal_numero, nota_fiscal_data_emissao, nota_fiscal_detalhes) VALUES
(1, 'NF123456', '2025-04-02', 'Venda de amendoim para empresa Exemplo'),
(2, 'NF654321', '2025-04-11', 'Venda parcelada de amendoim para AgroNutri SA'),
(3, 'NF234567', '2025-04-06', 'Venda para Food Quality'),
(4, 'NF345678', '2025-04-13', 'Exportação AgroExport'),
(5, 'NF456789', '2025-04-16', 'Orgânico NutriPeanut'),
(6, 'NF567890', '2025-04-19', 'Qualidade Cereal Market'),
(7, 'NF678901', '2025-04-21', 'Premium Organic Foods'),
(8, 'NF789012', '2025-04-23', 'Export Global Nuts'),
(9, 'NF890123', '2025-04-26', 'Experimental AmendoimBrasil'),
(10, 'NF901234', '2025-04-29', 'Safra 2025 completa');