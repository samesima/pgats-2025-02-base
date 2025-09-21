const request = require('supertest');
const { expect } = require('chai');

require('dotenv').config();

describe('Checkout GRAPHQL API', function () {
    describe('Checkout', async function () {
        const mutationCheckout = `
            mutation Checkout($items: [CheckoutItemInput!]!, $freight: Float!, $paymentMethod: String!, $cardData: CardDataInput) {
                checkout(items: $items, freight: $freight, paymentMethod: $paymentMethod, cardData: $cardData) {
                    freight
                    items {
                        productId
                        quantity
                    }
                    paymentMethod
                    userId
                    valorFinal
                }
            }
        `;

        let token;
        before(async function () {
            const mutationRegister = `
                mutation Register($name: String!, $email: String!, $password: String!) {
                    register(name: $name, email: $email, password: $password) {
                        name
                        email
                    }
                }
            `;
            const mutationLogin = `
                mutation Login($email: String!, $password: String!) {
                    login(email: $email, password: $password) {
                        token
                    }
                }
            `;

            const variables = { name: "Juliana Samesima", email: "julianagraphql@email.com", password: "123456" };
            
            await request(process.env.BASE_URL_GRAPHQL)
                .post("/graphql")
                .send({ query: mutationRegister, variables });

            const resultLogin = await request(process.env.BASE_URL_GRAPHQL)
                .post("/graphql")
                .send({ query: mutationLogin, variables });

            token = resultLogin.body.data.login.token;
        });

        it('Deve retornar sucesso para pagamentos via boleto', async function () {
            const variables = require('../fixture/requisicoes/postCheckoutBoleto.json');

            const responseCheckout = await request(process.env.BASE_URL_GRAPHQL)
                .post("/graphql")
                .set('Authorization', `Bearer ${token}`)
                .send({ query: mutationCheckout, variables });
            
            expect(responseCheckout.body.errors).to.be.undefined;
            delete responseCheckout.body.data.checkout.userId;
            
            const expectedResponse = require('../fixture/respostas/deveRetornarSucessoParaPagamentosViaBoleto.json');

            expect(responseCheckout.body.data.checkout).to.deep.equal(expectedResponse);
        });

        it('Deve retornar sucesso para pagamentos via cartao de credito', async function () {
            const variables = require('../fixture/requisicoes/postCheckoutCartaoDeCredito.json');

            const responseCheckout = await request(process.env.BASE_URL_GRAPHQL)
                .post("/graphql")
                .set('Authorization', `Bearer ${token}`)
                .send({ query: mutationCheckout, variables });
            
            expect(responseCheckout.body.errors).to.be.undefined;
            delete responseCheckout.body.data.checkout.userId;
            
            const expectedResponse = require('../fixture/respostas/deveRetornarSucessoParaPagamentosViaCartaoDeCredito.json');

            expect(responseCheckout.body.data.checkout).to.deep.equal(expectedResponse);
        });

        it('Deve retornar erro caso as credenciais sejam inválidas', async function () {
            const variables = require('../fixture/requisicoes/postCheckoutBoleto.json');

            const responseCheckout = await request(process.env.BASE_URL_GRAPHQL)
                .post("/graphql")
                .set('Authorization', `Bearer tokenInvalido`)
                .send({ query: mutationCheckout, variables });
            
            expect(responseCheckout.body.errors).to.not.be.empty;
            expect(responseCheckout.body.errors[0].message).to.be.equal("Token inválido");
        });

        it('Deve retornar erro para pagamentos via cartao de credito quando não for informado os dados do cartão de crédito', async function () {
            const variables = require('../fixture/requisicoes/postCheckoutCartaoDeCreditoSemDadosDoCartao.json');

            const responseCheckout = await request(process.env.BASE_URL_GRAPHQL)
                .post("/graphql")
                .set('Authorization', `Bearer ${token}`)
                .send({ query: mutationCheckout, variables });
            
            expect(responseCheckout.body.errors).to.not.be.empty;
            expect(responseCheckout.body.errors[0].message).to.be.equal("Dados do cartão obrigatórios para pagamento com cartão");
        });

        it('Deve retornar erro quando o produto não for encontrado', async function () {
            const variables = require('../fixture/requisicoes/postCheckoutCartaoDeCreditoProdutoInvalido.json');

            const responseCheckout = await request(process.env.BASE_URL_GRAPHQL)
                .post("/graphql")
                .set('Authorization', `Bearer ${token}`)
                .send({ query: mutationCheckout, variables });
            
            expect(responseCheckout.body.errors).to.not.be.empty;
            expect(responseCheckout.body.errors[0].message).to.be.equal("Produto não encontrado");
        });
    });
});