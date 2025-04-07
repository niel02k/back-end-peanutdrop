-- Desativar verificação de chaves estrangeiras temporariamente
SET FOREIGN_KEY_CHECKS = 0;

-- 1️⃣ Tabelas com FK (devem ser removidas primeiro)
DROP TABLE IF EXISTS NOTAS_FISCAIS;
DROP TABLE IF EXISTS PAGAMENTOS;
DROP TABLE IF EXISTS CONTRATOS;
DROP TABLE IF EXISTS MENSAGENS;
DROP TABLE IF EXISTS PROPOSTA;
DROP TABLE IF EXISTS NEGOCIACOES;
DROP TABLE IF EXISTS OFERTAS;
DROP TABLE IF EXISTS AGR_CERTIFICACOES;
DROP TABLE IF EXISTS DEMANDAS;
DROP TABLE IF EXISTS RASTREAMENTO_PRODUCAO;
DROP TABLE IF EXISTS AGRICULTORES;

-- 2️⃣ Tabelas básicas sem FK (removidas por último)
DROP TABLE IF EXISTS CERTIFICACOES;
DROP TABLE IF EXISTS USUARIOS;
DROP TABLE IF EXISTS EMPRESAS;
DROP TABLE IF EXISTS AMENDOINS;

-- Reativar verificação de chaves estrangeiras
SET FOREIGN_KEY_CHECKS = 1;


-- Insert ficticio


-- Selects
-- 1 ADM, 3 agric, 3 emp  
SELECT usu_id, usu_tipo_usuario, usu_nome, usu_documento, usu_email, usu_senha, usu_endereco, usu_telefone, usu_data_cadastro FROM USUARIOS;

-- 3
SELECT emp_id, emp_razao_social, emp_nome_fantasia, emp_tipo_atividade, emp_telefone, emp_email FROM EMPRESAS;

-- 5
SELECT cert_id, cert_orgao_regulador, cert_nome FROM CERTIFICACOES;

-- 5
SELECT amen_id, amen_variedade, amen_tamanho, amen_outras_caracteristicas FROM AMENDOINS;

-- 3
SELECT agri_id, agri_localizacao_propriedade, agri_tipos_amendoim_cultivados, agri_certificacoes, agri_outras_informacoes FROM AGRICULTORES;

-- 4 para cada agricultor
SELECT rast_id, agri_id, amen_id, rast_data_plantacao, rast_data_colheita, rast_informacoes_adicionais, rast_area_plantacao FROM RASTREAMENTO_PRODUCAO;

-- 1 sem nenhuma, 1 com 2 e 1 com 1 certificação
SELECT agr_cert_id, agri_id, cert_id, agr_local, agr_data, agr_arquivo, agr_status FROM AGR_CERTIFICACOES;

-- 3 demandas
SELECT demanda_id, emp_id, amen_id, demanda_quantidade, demanda_preco_maximo, demanda_data_entrega, demanda_outras_informacoes, demanda_data_publicacao, demanda_ativa FROM DEMANDAS;

-- 2 ofertas
SELECT oferta_id, agri_id, amen_id, oferta_quantidade, oferta_preco, oferta_data_colheita, oferta_outras_informacoes, oferta_data_publicacao, oferta_ativa FROM OFERTAS;

-- 2 negociações
SELECT negoc_id, oferta_id, demanda_id, negoc_status FROM NEGOCIACOES;

-- 2 propostas
SELECT prop_id, negoc_id, emp_id, prop_preco, prop_quantidade, prop_data_envio, prop_status FROM PROPOSTA;

-- 4 mensagens
SELECT mens_id, negoc_id, id_usuario_remetente, mens_conteudo, mens_data_envio, mens_visualizada FROM MENSAGENS;

-- 2 contratos
SELECT contrato_id, id_negociacao, contrato_data_assinatura, contrato_detalhes_contrato FROM CONTRATOS;

-- 2 pagamentos
SELECT pag_id, contrato_id, pag_valor, pag_data_pagamento, pag_status FROM PAGAMENTOS;

-- 2 nora fiscal
SELECT nota_fiscal_id, contrato_id, nota_fiscal_numero, nota_fiscal_data_emissao, nota_fiscal_detalhes FROM NOTAS_FISCAIS;