const request = require('supertest');
const { expect } = require('chai');

require('dotenv').config();

describe('User REST API', function () {
    describe('Registrar usuário', async function () {
        it('Deve retornar sucesso com código 201 e os dados do usuário', async function () {
            const postRegister = require('../fixture/requisicoes/postRegister.json');

            const respostaRegister = await request(process.env.BASE_URL_REST)
                .post("/users/register")
                .send(postRegister);

            const respostaEsperadaRegister = require('../fixture/respostas/deveRetornarSucessoComCodigo201EOsDadosDoUsuario.json');
            
            expect(respostaRegister.status).to.equal(201);
            expect(respostaRegister.body).to.deep.equal(respostaEsperadaRegister);
        });

        it('Deve retornar erro com código 400 se o usuário já existir', async function () {
            const postRegister = require('../fixture/requisicoes/postRegister.json');

            const respostaRegister = await request(process.env.BASE_URL_REST)
                .post("/users/register")
                .send(postRegister);

            const respostaEsperadaRegister = require('../fixture/respostas/deveRetornarErroComCodigo400SeOUsuarioJaExistir.json');
            
            expect(respostaRegister.status).to.equal(400);
            expect(respostaRegister.body).to.deep.equal(respostaEsperadaRegister);
        });
    });

    describe('Login usuário', async function () {
        it('Deve retornar sucesso com código 200 e o token do usuário', async function () {
            const postLogin = require('../fixture/requisicoes/postLogin.json');

            const respostaLogin = await request(process.env.BASE_URL_REST)
                .post("/users/login")
                .send(postLogin);
            
            expect(respostaLogin.status).to.equal(200);
            expect(respostaLogin.body.token).to.exist;
            expect(respostaLogin.body.token).to.be.a('string').and.is.not.empty;
        });

        it('Deve retornar erro com código 401 se as credenciais forem inválidas', async function () {
            const postLoginErro = require('../fixture/requisicoes/postLoginErro.json');

            const respostaLogin = await request(process.env.BASE_URL_REST)
                .post("/users/login")
                .send(postLoginErro);

            const respostaEsperadaLogin = require('../fixture/respostas/deveRetornarErroComCodigo401SeAsCredenciaisForemInvalidas.json');
            
            expect(respostaLogin.status).to.equal(401);
            expect(respostaLogin.body).to.deep.equal(respostaEsperadaLogin);
        });
    });
});