const request = require('supertest');
const { expect } = require('chai');

require('dotenv').config();

describe('Checkout REST API', function () {
    let token;
    describe('Checkout', async function () {
        beforeEach(async function () {
            let postLogin = require('../fixture/requisicoes/postLogin.json');
            const respostaLogin = await request(process.env.BASE_URL_REST)
                .post("/users/login")
                .send(postLogin);
            
            token = respostaLogin.body.token;
        });

        it('Deve retornar sucesso com código 200 para pagamentos via boleto e os dados de checkout', async function () {
            const postCheckout = require('../fixture/requisicoes/postCheckoutBoleto.json');

            const respostaCheckout = await request(process.env.BASE_URL_REST)
                .post("/checkout")
                .set('Authorization', `Bearer ${token}`)
                .send(postCheckout);

            const respostaEsperadaCheckout = require('../fixture/respostas/deveRetornarSucessoComCodigo200ParaPagamentosViaBoletoEOsDadosDoCheckout.json');
            
            expect(respostaCheckout.status).to.equal(200);
            expect(respostaCheckout.body).to.deep.equal(respostaEsperadaCheckout);
        });

        it('Deve retornar sucesso com código 200 para pagamentos via cartão de crédito e os dados de checkout', async function () {
            const postCheckout = require('../fixture/requisicoes/postCheckoutCartaoDeCredito.json');

            const respostaCheckout = await request(process.env.BASE_URL_REST)
                .post("/checkout")
                .set('Authorization', `Bearer ${token}`)
                .send(postCheckout);

            const respostaEsperadaCheckout = require('../fixture/respostas/deveRetornarSucessoComCodigo200ParaPagamentosViaCartaoDeCreditoEOsDadosDoCheckout.json');
            
            expect(respostaCheckout.status).to.equal(200);
            expect(respostaCheckout.body).to.deep.equal(respostaEsperadaCheckout);
        });

        it('Deve retornar erro com código 401 se o token não for válido', async function () {
            const postCheckout = require('../fixture/requisicoes/postCheckoutBoleto.json');

            const respostaCheckout = await request(process.env.BASE_URL_REST)
                .post("/checkout")
                .set('Authorization', `Bearer tokeninvalido`)
                .send(postCheckout);

            const respostaEsperadaCheckout = require('../fixture/respostas/deveRetornarErroComCodigo401SeOTokenNaoForValido.json');
            
            expect(respostaCheckout.status).to.equal(401);
            expect(respostaCheckout.body).to.deep.equal(respostaEsperadaCheckout);
        });

        it('Deve retornar erro com código 400 quando não informar os dados do cartão de crédito', async function () {
            const postCheckoutErro = require('../fixture/requisicoes/postCheckoutCartaoDeCreditoErro.json');

            const respostaCheckout = await request(process.env.BASE_URL_REST)
                .post("/checkout")
                .set('Authorization', `Bearer ${token}`)
                .send(postCheckoutErro);

            const respostaEsperadaCheckout = require('../fixture/respostas/deveRetornarErroComCodigo400QuandoNaoInformarOsDadosDoCartaoDeCredito.json');
            
            expect(respostaCheckout.status).to.equal(400);
            expect(respostaCheckout.body).to.deep.equal(respostaEsperadaCheckout);
        });

        it('Deve retornar erro com código 400 quando o produto não for encontrado', async function () {
            const postCheckoutErroProduto = require('../fixture/requisicoes/postCheckoutBoletoErroProduto.json');

            const respostaCheckout = await request(process.env.BASE_URL_REST)
                .post("/checkout")
                .set('Authorization', `Bearer ${token}`)
                .send(postCheckoutErroProduto);

            const respostaEsperadaCheckout = require('../fixture/respostas/deveRetornarErroComCodigo400QuandoOProdutoNaoForEncontrado.json');
            
            expect(respostaCheckout.status).to.equal(400);
            expect(respostaCheckout.body).to.deep.equal(respostaEsperadaCheckout);
        });
    });
});