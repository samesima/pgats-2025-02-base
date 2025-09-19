const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');

const app = require('../app.js');
const checkoutService = require('../../src/services/checkoutService.js');
const userService = require('../../src/services/userService.js');

require('dotenv').config();

describe('Checkout REST API', function () {
    let token;
    describe('Checkout', async function () {
        before(async function () {
            let postRegister = require('../fixture/requisicoes/postRegisterCheckout.json');
            await request(process.env.BASE_URL_REST)
                .post("/users/register")
                .send(postRegister);
        });

        beforeEach(async function () {
            let postLogin = require('../fixture/requisicoes/postLoginCheckout.json');
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

    describe('Checkout Controller', async function () {
        before(async function () {
            let postRegister = require('../fixture/requisicoes/postRegisterCheckout.json');
            await request(app)
                .post("/api/users/register")
                .send(postRegister);

            let postLogin = require('../fixture/requisicoes/postLoginCheckout.json');
            const respostaLogin = await request(app)
                .post("/api/users/login")
                .send(postLogin);
            token = respostaLogin.body.token;
        });

        afterEach(function () {
            sinon.restore();
        });

        it('Deve chamar o serviço de checkout com os parâmetros corretos', async function () {
            let checkoutServiceMock = sinon.stub(checkoutService, 'checkout');
            let postCheckout = require('../fixture/requisicoes/postCheckoutBoleto.json');

            await request(app)
                .post("/api/checkout")
                .set('Authorization', `Bearer ${token}`)
                .send(postCheckout);

            expect(checkoutServiceMock.calledOnce).to.be.true;
            expect(checkoutServiceMock.calledWith(sinon.match.any, postCheckout.items, postCheckout.freight, postCheckout.paymentMethod, undefined)).to.be.true;
        });

        it('Deve retornar erro com código 401 caso o token seja inválido', async function () {
            let userServiceMock = sinon.stub(userService, 'verifyToken').returns(null);
            let postCheckout = require('../fixture/requisicoes/postCheckoutBoleto.json');

            let checkoutResponse = await request(app)
                .post("/api/checkout")
                .set('Authorization', `Bearer ${token}`)
                .send(postCheckout);

            expect(userServiceMock.calledOnce).to.be.true;
            expect(checkoutResponse.status).to.equal(401);
        });

        it('Deve retornar erro com código 400 caso o checkout retorne uma exceção', async function () {
            sinon.stub(checkoutService, 'checkout').throws(new Error('Produto não encontrado'));
            let postCheckout = require('../fixture/requisicoes/postCheckoutBoleto.json');

            let checkoutResponse = await request(app)
                .post("/api/checkout")
                .set('Authorization', `Bearer ${token}`)
                .send(postCheckout);

            expect(checkoutResponse.status).to.equal(400);
            expect(checkoutResponse.body).to.deep.equal({ error: 'Produto não encontrado' });
        });
    });
});