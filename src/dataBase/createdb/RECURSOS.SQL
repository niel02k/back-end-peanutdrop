USE bd_tcc_etim_123_g3;

select * from demandas;

-- Desativar verificação de chaves estrangeiras temporariamente
SET FOREIGN_KEY_CHECKS = 0;

-- 1️⃣ Tabelas com FK (devem ser removidas primeiro)
-- Primeiro: Remover tabelas que têm chaves estrangeiras (em ordem reversa de criação)
DROP TABLE IF EXISTS recuperacao_senha;
DROP TABLE IF EXISTS MENSAGENS;
DROP TABLE IF EXISTS PAGAMENTOS;
DROP TABLE IF EXISTS NOTAS_FISCAIS;
DROP TABLE IF EXISTS CONTRATOS;
DROP TABLE IF EXISTS PROPOSTAS;
DROP TABLE IF EXISTS NEGOCIACOES;
DROP TABLE IF EXISTS OFERTAS;
DROP TABLE IF EXISTS DEMANDAS;
DROP TABLE IF EXISTS AGR_CERTIFICACOES;
DROP TABLE IF EXISTS RASTREAMENTO_PRODUCAO;
DROP TABLE IF EXISTS USUARIOS;

-- Depois: Remover tabelas principais (sem dependências)
DROP TABLE IF EXISTS EMPRESAS;
DROP TABLE IF EXISTS AGRICULTORES;
DROP TABLE IF EXISTS CERTIFICACOES;
DROP TABLE IF EXISTS AMENDOINS;
    

    

-- Reativar verificação de chaves estrangeiras
SET FOREIGN_KEY_CHECKS = 1;

-- Selects campo por campo

-- USUARIOS - 10 registros
SELECT 
    usu_id, 
    usu_tipo_usuario, 
    usu_nome, 
    usu_imagem, 
    usu_documento, 
    usu_email, 
    usu_senha, 
    usu_endereco, 
    usu_telefone, 
    usu_data_cadastro, 
    agri_id, 
    emp_id, 
    usu_cep, 
    usu_cidade, 
    usu_estado 
FROM USUARIOS;

-- EMPRESAS - 10 registros
SELECT 
    emp_id, 
    emp_razao_social, 
    emp_nome_fantasia, 
    emp_tipo_atividade, 
    emp_telefone, 
    emp_email, 
    emp_img 
FROM EMPRESAS;

-- CERTIFICACOES - 10 registros
SELECT 
    cert_id, 
    cert_orgao_regulador, 
    cert_nome 
FROM CERTIFICACOES;

-- AMENDOINS - 10 registros
SELECT 
    amen_id, 
    amen_variedade, 
    amen_tamanho, 
    amen_outras_caracteristicas 
FROM AMENDOINS;

-- AGRICULTORES - 10 registros
SELECT 
    agri_id, 
    agri_nome, 
    agri_localizacao_propriedade, 
    agri_tipos_amendoim_cultivados, 
    agri_certificacoes, 
    agri_outras_informacoes, 
    agri_telefone, 
    agri_email, 
    agri_img 
FROM AGRICULTORES;

-- RASTREAMENTO_PRODUCAO - 20 registros
SELECT 
    rast_id, 
    agri_id, 
    amen_id, 
    rast_data_plantacao, 
    rast_data_colheita, 
    rast_informacoes_adicionais, 
    rast_area_plantacao 
FROM RASTREAMENTO_PRODUCAO;

-- AGR_CERTIFICACOES - 10 registros
SELECT 
    agr_cert_id, 
    agri_id, 
    cert_id, 
    agr_local, 
    agr_data, 
    agr_arquivo, 
    agr_status 
FROM AGR_CERTIFICACOES;

-- DEMANDAS - 10 registros
SELECT 
    demanda_id, 
    emp_id, 
    amen_id, 
    demanda_quantidade, 
    demanda_preco_maximo, 
    demanda_data_entrega, 
    demanda_outras_informacoes, 
    demanda_data_publicacao, 
    demanda_ativa, 
    demanda_imagem 
FROM DEMANDAS;

-- OFERTAS - 10 registros
SELECT 
    oferta_id, 
    agri_id, 
    agri_nome, 
    amen_id, 
    oferta_quantidade, 
    oferta_preco, 
    oferta_data_colheita, 
    oferta_outras_informacoes, 
    oferta_data_publicacao, 
    oferta_ativa, 
    oferta_img 
FROM OFERTAS;

-- NEGOCIACOES - 10 registros
SELECT 
    negoc_id, 
    oferta_id, 
    demanda_id, 
    negoc_status 
FROM NEGOCIACOES;

-- PROPOSTA - 10 registros
SELECT 
    prop_id, 
    negoc_id, 
    emp_id, 
    prop_preco, 
    prop_quantidade, 
    prop_data_envio, 
    prop_status 
FROM PROPOSTA;

-- MENSAGENS - 10 registros
SELECT 
    mens_id, 
    id_usuario_remetente, 
    negoc_id, 
    mens_conteudo, 
    mens_data_envio, 
    mens_visualizada 
FROM MENSAGENS;

-- CONTRATOS - 10 registros
SELECT 
    contrato_id, 
    id_negociacao, 
    contrato_data_assinatura, 
    contrato_detalhes_contrato 
FROM CONTRATOS;

-- PAGAMENTOS - 10 registros
SELECT 
    pag_id, 
    contrato_id, 
    pag_valor, 
    pag_data_pagamento, 
    pag_status 
FROM PAGAMENTOS;

-- NOTAS_FISCAIS - 10 registros
SELECT 
    nota_fiscal_id, 
    contrato_id, 
    nota_fiscal_numero, 
    nota_fiscal_data_emissao, 
    nota_fiscal_detalhes 
FROM NOTAS_FISCAIS;