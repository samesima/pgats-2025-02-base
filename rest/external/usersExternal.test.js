const request = require('supertest');
const { expect } = require('chai');
const sinon = require('sinon');

const app = require('../app.js');
const userService = require('../../src/services/userService');

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

    describe('User Controller', async function () {
        afterEach(function () {
            sinon.restore();
        });

        it('Deve chamar o método registrarUsuario com os dados corretos e retornar sucesso com código 201 se os dados do usuário estiverem corretos', async function () {
            let postRegister = require('../fixture/requisicoes/postRegister.json');
            let userServiceMock = sinon.stub(userService, 'registerUser').returns({ name: "Juliana Samesima", email: "juliana@email.com" });

            let resultRegister = await request(app)
                .post("/api/users/register")
                .send(postRegister);

            expect(userServiceMock.calledOnce).to.be.true;
            expect(userServiceMock.calledWith(postRegister.name, postRegister.email, postRegister.password)).to.be.true;
            expect(resultRegister.status).to.equal(201);
        });

        it('Deve retornar erro com código 400 caso o email já esteja cadastrado', async function () {
            let postRegister = require('../fixture/requisicoes/postRegister.json');
            sinon.stub(userService, 'registerUser').returns(null);

            let resultRegister = await request(app)
                .post("/api/users/register")
                .send(postRegister);

            expect(resultRegister.status).to.equal(400);
            expect(resultRegister.body).to.deep.equal({ error: 'Email já cadastrado' });
        });

        it('Deve chamar o método authenticate com os dados corretos e retornar sucesso com código 200 se as credenciais do usuário estiverem corretas', async function () {
            let postLogin = require('../fixture/requisicoes/postLogin.json');
            let responseLogin = { token: "valid-token" };
            let userServiceMock = sinon.stub(userService, 'authenticate').returns(responseLogin);

            let resultLogin = await request(app)
                .post("/api/users/login")
                .send(postLogin);

            expect(userServiceMock.calledOnce).to.be.true;
            expect(userServiceMock.calledWith(postLogin.email, postLogin.password)).to.be.true;
            expect(resultLogin.status).to.equal(200);
            expect(resultLogin.body).to.deep.equal(responseLogin);
        });

        it('Deve retornar erro com código 401 caso as credenciais do usuário estiverem incorretas', async function () {
            let postLogin = require('../fixture/requisicoes/postLogin.json');
            let responseLoginErro = require('../fixture/respostas/deveRetornarErroComCodigo401SeAsCredenciaisForemInvalidas.json');
            sinon.stub(userService, 'authenticate').returns(null);

            let resultLogin = await request(app)
                .post("/api/users/login")
                .send(postLogin);
            
            expect(resultLogin.status).to.equal(401);
            expect(resultLogin.body).to.deep.equal(responseLoginErro);
        });
    });
});