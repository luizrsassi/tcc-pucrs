# Clube do Livro Online
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-4A633F?style=for-the-badge&logo=playwright&logoColor=white)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

### 📝 Descrição do Projeto <br>
Este é uma rede social para criação, administração ou apenas participação em **clubes de leitura** desenvolvida com a **MERN Stack**: MongoDB, Express.js, React e Node.js.

---

### ✨ Funcionalidades <br>
* **Autenticação de Usuário:** Registro, Login e Logout seguros com controle de sessão.
* **Gerenciamento de Clubes:** Criação, edição, visualização e exclusão de clubes de leitura.
* **Participação em Clubes:** Usuários podem solicitar participação e serem aprovados em clubes.
* **Gerenciamento de Reuniões:** Agendamento e gerenciamento de reuniões para clubes.
* **Discussões:** Espaço para discussões e interações dentro dos clubes.
* **API RESTful:** Backend robusto e escalável construído com Express.js e Mongoose.

---

### 🚀 Tecnologias Utilizadas <br>
* **Frontend:**
    * **React:** Biblioteca JavaScript para construção de interfaces de usuário.
    * **Vite:** Ferramenta de build rápida para projetos web modernos.
    * **Chakra UI:** Biblioteca de componentes para UI bonita e acessível.
    * **Axios:** Cliente HTTP para fazer requisições à API.
    * **React Router Dom:** Gerenciamento de rotas no frontend.
* **Backend:**
    * **Node.js:** Ambiente de execução JavaScript.
    * **Express.js:** Framework web para Node.js.
    * **Mongoose:** ODM (Object Data Modeling) para MongoDB.
    * **bcryptjs:** Para hash seguro de senhas.
    * **jsonwebtoken:** Para autenticação baseada em tokens JWT.
    * **dotenv:** Para carregar variáveis de ambiente.
* **Banco de Dados:**
    * **MongoDB:** Banco de dados NoSQL.
* **Testes:**
    * **Playwright:** Framework de testes End-to-End (E2E).

---

### 🛠️ Pré-requisitos <br>
Antes de clonar e rodar o projeto, certifique-se de ter instalado em sua máquina: <br>

* **Node.js:** v20 ou superior ([Download](https://nodejs.org/en/download/))
* **npm:** (geralmente vem com o Node.js)

---

### ⚙️ Instalação e Configuração <br>
Siga os passos abaixo para configurar e rodar o projeto em seu ambiente local: <br>

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/luizrsassi/tcc-pucrs.git
    cd tcc-pucrs
    ```

2.  **Instalar dependências do Backend:**
    Navegue até a pasta raiz e instale as dependências:
    ```bash
    npm install
    cd .. # Volte para a raiz do projeto
    ```

3.  **Instalar dependências do Frontend:**
    Navegue até a pasta `frontend/` e instale as dependências:
    ```bash
    cd frontend
    npm install
    cd .. # Volte para a raiz do projeto
    ```

4.  **Configurar variáveis de ambiente:**
    Crie um arquivo `.env` na **raiz** do projeto (no mesmo nível das pastas `backend/` e `frontend/`) com as seguintes variáveis:

    ```env
    # Variáveis do Backend
    MONGO_URI=mongodb://localhost:27017/seu_banco_de_dados_de_teste # Altere o nome do BD se quiser
    JWT_SECRET=sua_chave_secreta_jwt_bem_longa_e_aleatoria
    JWT_EXPIRES_IN=1d
    ```

---

### 🚀 Rodando a Aplicação <br>
Para iniciar sua aplicação MERN Stack:

1.  **Inicie o servidor MongoDB:**
    Certifique-se de que o **MongoDB Server** esteja rodando em sua máquina local (conforme os pré-requisitos).

2.  **Inicie o Backend:**
    Em um terminal separado, navegue até a pasta `backend/` e execute:
    ```bash
    npm start server.js
    ```
    O backend estará rodando em `http://localhost:5000`.

3.  **Inicie o Frontend:**
    Em outro terminal separado, navegue até a pasta `frontend/` e execute:
    ```bash
    cd frontend
    npm start vite
    ```
    O frontend estará acessível em: `http://localhost:5173`.

Você pode interagir com a aplicação diretamente pelo navegador acessando o endereço do frontend.

---

### 🧪 Rodando os Testes <br>
Este projeto utiliza Playwright para testes End-to-End (E2E).

1.  **Certifique-se de que o backend e o frontend estão rodando.**
2.  Navegue até a pasta `frontend/`:
    ```bash
    cd frontend
    ```
3.  Execute os testes:
    ```bash
    npx playwright test
    ```
    Os resultados dos testes e os traces (para depuração) serão salvos na pasta `frontend/test-results/`.

---

### 📧 Contato <br>
**Luiz Renato Sassi** - [luizrenato171@gmail.com](mailto:luizrenato171@gmail.com)

Link do Projeto: [https://github.com/luizrsassi/tcc-pucrs](https://github.com/luizrsassi/tcc-pucrs)

---
