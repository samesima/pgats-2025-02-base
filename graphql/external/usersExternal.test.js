const request = require('supertest');
const { expect } = require('chai');

require('dotenv').config();

describe('User GRAPHQL API', function () {
    describe('Registrar usuário', async function () {
        const mutationRegister = `
            mutation Register($name: String!, $email: String!, $password: String!) {
                register(name: $name, email: $email, password: $password) {
                    name
                    email
                }
            }
        `

        it('Deve retornar sucesso com os dados do usuário', async function () {
            const variables = { name: "Juliana Samesima", email: "julianagraphql@email.com", password: "123456" };

            const responseRegister = await request(process.env.BASE_URL_GRAPHQL)
                .post("/graphql")
                .send({ query: mutationRegister, variables });
            
            expect(responseRegister.body.errors).to.be.undefined;
            expect(responseRegister.body.data.register).to.deep.equal({ name: "Juliana Samesima", email: "julianagraphql@email.com" });
        });

        it('Deve retornar erro se o email já estiver registrado', async function () {
            const variables = { name: "Juliana Samesima", email: "julianagraphql@email.com", password: "123456" };

            const responseRegister = await request(process.env.BASE_URL_GRAPHQL)
                .post("/graphql")
                .send({ query: mutationRegister, variables });

            expect(responseRegister.body.errors).to.not.be.empty;
            expect(responseRegister.body.errors[0].message).to.be.equal("Email já cadastrado");
        });
    });

    describe('Login usuário', async function () {
        const mutationLogin = `
            mutation Login($email: String!, $password: String!) {
                login(email: $email, password: $password) {
                    token
                }
            }
        `
        const mutationLoginWithUser = `
            mutation Login($email: String!, $password: String!) {
                login(email: $email, password: $password) {
                    token
                    user { name email }
                }
            }
        `

        it('Deve retornar sucesso com o token do usuário', async function () {
            const variables = { email: "julianagraphql@email.com", password: "123456" };

            const responseLogin = await request(process.env.BASE_URL_GRAPHQL)
                .post("/graphql")
                .send({ query: mutationLogin, variables });
            
            expect(responseLogin.body.errors).to.be.undefined;
            expect(responseLogin.body.data.login.token).to.be.a('string').and.not.empty;
        });

        it('Deve retornar sucesso com o token do usuário e o usuário (Bug encontrado)', async function () {
            /*
                BUG: No schema.js a mutation login() permite o retorno do usuário, mas ao fazer isso o sistema
                retorna um erro em vez do usuário.
            */
            const variables = { email: "julianagraphql@email.com", password: "123456" };

            const responseLogin = await request(process.env.BASE_URL_GRAPHQL)
                .post("/graphql")
                .send({ query: mutationLoginWithUser, variables });
            
            expect(responseLogin.body.errors).to.be.undefined;
            expect(responseLogin.body.data.login.token).to.be.a('string').and.not.empty;
            expect(responseLogin.body.data.login.user).to.deep.equal({ name: "Juliana Samesima", email: "julianagraphql@email.com" });
        });

        it('Deve retornar erro caso as credenciais sejam inválidas', async function () {
            const variables = { email: "outrajulianagraphql@email.com", password: "123456" };

            const responseLogin = await request(process.env.BASE_URL_GRAPHQL)
                .post("/graphql")
                .send({ query: mutationLoginWithUser, variables });
            
            expect(responseLogin.body.errors).to.not.be.empty;
            expect(responseLogin.body.errors[0].message).to.be.equal("Credenciais inválidas");
        });
    });
});