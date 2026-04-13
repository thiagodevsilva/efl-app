# Guia de ambiente — EFL App (Expo)

Este documento descreve como preparar a máquina, subir a **API** (opcional) e o **app mobile**, e como **ver a interface** no celular, emulador ou navegador.

---

## 1. O que você precisa instalado

### Sistema (WSL Ubuntu / Linux)

- Ubuntu no WSL2 (ou Linux nativo).
- Git.

### Node.js (recomendado: NVM + Node 20)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
node -v
npm -v
```

### Ferramentas úteis (global, opcional)

```bash
npm install -g eas-cli
```

> O **`expo-cli` global está descontinuado**. Use sempre **`npx expo ...`** dentro do projeto.

### Para rodar no Android

Escolha **pelo menos uma** opção:

1. **Celular físico** com o app **Expo Go** (Play Store).
2. **Android Studio** + emulador (AVD), com `adb` no PATH.

No WSL, o emulador costuma rodar no **Windows**; nesse caso você precisa do **ADB no Windows** e, às vezes, de `adb reverse` ou do modo **Tunnel** do Expo (veja a seção 6).

### Para rodar no iOS

Somente em **macOS** + Xcode + simulador. No WSL/Linux não há simulador iOS oficial.

---

## 2. Clonar e instalar dependências

### API (`efl-api`)

```bash
cd /caminho/para/efl-brazil/efl-api
npm install
```

Configure o `.env` da API conforme o README ou variáveis do projeto (banco, JWT, etc.).

### App (`efl-app`)

```bash
cd /caminho/para/efl-brazil/efl-app
npm install
```

O repositório inclui um arquivo **`.npmrc`** com `legacy-peer-deps=true` para evitar conflitos de dependências do ecossistema Expo/React.

---

## 3. Variáveis de ambiente do app

O Expo carrega automaticamente o arquivo **`.env`** na raiz do `efl-app` ao rodar `npx expo start` / `npm run start` (via `@expo/env`).

- **`EXPO_PUBLIC_*`**: embutidas no **JavaScript** do app (use para URL da API, etc.).
- **`REACT_NATIVE_PACKAGER_HOSTNAME`**: lida pelo **CLI do Expo** para montar o link do **Metro** (`exp://…:8081` no QR code). No WSL, sem isso o Expo pode escolher um IP **`172.x`** de bridge Docker — o celular **não conecta**.

### Arquivo `.env`

1. Copie o modelo:

   ```bash
   cd /caminho/para/efl-brazil/efl-app
   cp .env.example .env
   ```

2. Edite **`.env`**:

   | Variável | Uso |
   |----------|-----|
   | `EXPO_PUBLIC_API_URL` | Base da **API** (`efl-api`, porta típica **8085**). No Expo Go: `http://IP-DO-WINDOWS-NA-WIFI:8085` |
   | `REACT_NATIVE_PACKAGER_HOSTNAME` | Só o **IP** (sem `http://`) do Windows no **Ethernet/Wi‑Fi real**, para o **QR code** apontar para `exp://ESSE_IP:8081` |

   **Descobrir o IP no Windows** (rode no WSL ou no CMD):

   ```bash
   ipconfig.exe
   ```

   Use o **IPv4** do adaptador da internet (ex.: `192.168.15.23`), **não** `172.x` do WSL/Docker.

O app lê a API em `constants/config.ts` (`API_BASE_URL`).

### Sem arquivo `.env` (opcional)

Você ainda pode passar variável só na sessão do terminal:

```bash
cd /caminho/para/efl-brazil/efl-app
EXPO_PUBLIC_API_URL=http://192.168.0.42:8085 npm run start
```

> **CORS na API:** o `FRONT_URL` lista origens **web** (browser). Requisições **sem header `Origin`** (Expo Go / app nativo) são aceitas. O header **`X-EFL-Mobile`** está liberado no CORS. Reinicie a API após mudar `FRONT_URL`.

> Se usar **emulador Android** no Windows apontando para API no WSL, `127.0.0.1` no emulador **não** é o WSL. Nesse caso use o IP da máquina Windows na rede, ou `10.0.2.2` apontando para a porta exposta no host, conforme sua configuração de rede entre WSL e Windows.

---

## 4. Subir a API (NestJS)

Na pasta **`efl-api`**, o comando de desenvolvimento com reload é:

```bash
cd /caminho/para/efl-brazil/efl-api
npm run start:dev
```

> **Não** existe `npm run dev` neste projeto; o equivalente é **`npm run start:dev`**.

Outros comandos úteis:

| Comando            | Uso                          |
|--------------------|------------------------------|
| `npm run start`    | Nest sem watch               |
| `npm run start:debug` | Nest com debugger       |
| `npm run build`    | Compilar para `dist/`        |
| `npm run lint`     | ESLint                       |
| `npm test`         | Testes                       |

Confirme no terminal em qual **porta** a API sobe (padrão **`8085`**, variável `PORT` no `.env` da API) e use essa porta no `EXPO_PUBLIC_API_URL`.

---

## 5. Subir o app (Expo)

Na pasta **`efl-app`**:

```bash
cd /caminho/para/efl-brazil/efl-app
npm run start
```

O script padrão **`npm run start`** executa **`expo start --tunnel`** (túnel), para funcionar com **Expo Go no celular** quando o código roda no **WSL** (a LAN `192.168…:8081` costuma não encaminhar até o Metro).

### Se o QR code mostrar `exp://172.x.x.x` e o Expo Go falhar

Em WSL/Docker, o Expo às vezes escolhe um IP **virtual** (`172.x`) que o **celular não alcança**. Defina **`REACT_NATIVE_PACKAGER_HOSTNAME`** no `.env` com o IPv4 do Windows (veja seção 3).

### WSL2 + Expo Go: QR com `192.168…` e mesmo assim não carrega

O Metro roda **dentro do WSL**. Mesmo com `exp://192.168.x.x:8081` correto, o **Windows normalmente não repassa** conexões da Wi‑Fi (`192.168…:8081`) para o processo do Metro no WSL. Por isso o celular **não consegue baixar o bundle**.

**Solução recomendada (Expo Go no celular com projeto no WSL):** o **`npm run start` padrão já usa túnel** (`expo start --tunnel`): o QR aponta para um host público que encaminha até o Metro. O projeto inclui **`@expo/ngrok`** para não precisar de instalação global.

**Alternativas avançadas:** modo de rede **espelhada** do WSL2 ou **portproxy** no Windows — ver [Networking no WSL](https://learn.microsoft.com/pt-br/windows/wsl/networking).

### Atalhos úteis (scripts do `package.json`)

| Comando                 | O que faz |
|-------------------------|-----------|
| `npm run start`         | **Túnel** (`expo start --tunnel`) — padrão para **Expo Go + WSL** |
| `npm run start:go` / `npm run start:tunnel` | Igual ao `start` (túnel) |
| `npm run start:clear`   | Túnel + limpa cache do Metro (`--clear`) |
| `npm run start:lan`     | **LAN** (`--lan`) — se você configurou encaminhamento de porta / rede espelhada no WSL |
| `npm run start:localhost` | Só máquina local (`expo start --localhost`) |
| `npm run android`       | Túnel + abrir Android |
| `npm run ios`           | Túnel + simulador iOS (macOS) |
| `npm run web`           | Roda no navegador (web) |
| `npm run lint`          | ESLint |

> LAN manual: **`npx expo start --lan`** (normalmente exige `REACT_NATIVE_PACKAGER_HOSTNAME` no `.env` e rede que encaminhe a porta **8081** até o WSL).

---

## 6. Como ver a tela do app

### Opção A — Celular com Expo Go

1. Instale **Expo Go** na Play Store / App Store.
2. Na pasta `efl-app`, suba o Metro com **`npm run start`** (já usa **túnel** por padrão neste projeto).
3. Escaneie o **QR code** do terminal (Expo Go → “Scan QR code”, ou Câmera no iOS).

Com **túnel**, o celular **não precisa** alcançar `192.168…:8081` no seu PC. Se usar **`npm run start:lan`**, no **WSL2** isso frequentemente **não funciona** com celular físico (veja subseção acima).

O túnel pode ser um pouco mais lento, mas evita firewall e limitações de encaminhamento WSL → LAN.

### Opção B — Emulador Android

1. Abra um AVD no Android Studio (ou `emulator` pela linha de comando).
2. Com o emulador ligado:

```bash
cd /caminho/para/efl-brazil/efl-app
npm run android
```

Ou, com o Metro já aberto, pressione **`a`** no terminal do Expo para abrir no Android.

### Opção C — Navegador (web)

```bash
cd /caminho/para/efl-brazil/efl-app
npm run web
```

Útil para validar layout rápido; recursos nativos (MMKV, etc.) podem se comportar diferente do build Android.

---

## 7. Fluxo típico no dia a dia (API + app)

**Terminal 1 — API**

```bash
cd /caminho/para/efl-brazil/efl-api
npm run start:dev
```

**Terminal 2 — App**

Com `.env` já configurado (seção 3):

```bash
cd /caminho/para/efl-brazil/efl-app
npm run start
```

(É **túnel** por padrão. Para só LAN: `npm run start:lan`.)

Ou, sem `.env`, só para esta sessão:

```bash
EXPO_PUBLIC_API_URL=http://SEU_IP:8085 npm run start
```

Depois escolha **Expo Go**, **emulador** ou **web** conforme a seção 6.

---

## 8. Qualidade de código (app)

```bash
cd /caminho/para/efl-brazil/efl-app
npm run lint
```

TypeScript (checagem sem emitir arquivos):

```bash
npx tsc --noEmit
```

---

## 9. Observações importantes

- **`react-native-mmkv`** depende de **código nativo**. Quando passarem a usar `lib/storage.ts` de verdade, o fluxo recomendado é **development build** / **EAS Build**, não apenas o Expo Go, dependendo do que for habilitado.
- **`expo-secure-store`** funciona bem para tokens no fluxo de aluno; combina com a API quando vocês ligarem o login.
- Em **WSL**, se a API escutar só em `127.0.0.1` dentro do Linux, o **celular na rede** não alcança esse endereço; use o **IP da máquina** na LAN ou um túnel (ngrok, etc.) se precisar testar fora do emulador.

### WSL2 + Expo Go na mesma Wi‑Fi

1. A API (Nest) roda **no Linux do WSL**. O IP `172.x.x.x` da interface `eth0` do WSL é **rede virtual** entre Windows e WSL — **não** é o endereço que o celular na sua Wi‑Fi deve usar.
2. No `.env`, use o **IPv4 do Windows no adaptador da internet** (Wi‑Fi ou Ethernet física). No WSL você pode rodar `ipconfig.exe | findstr IPv4` (ou abrir `ipconfig` no CMD do Windows). Formato típico: `http://192.168.x.x:8085` (ajuste a porta ao `PORT` da API).
3. Confirme que o Nest escuta em **`0.0.0.0`** (não só `127.0.0.1`). No WSL: `ss -tlnp | grep 8085` — deve aparecer `0.0.0.0:8085` (o projeto `efl-api` já faz `listen(..., '0.0.0.0')`).
4. Se o celular não conectar mesmo com o IP certo: verifique **Firewall do Windows** (regra de entrada **TCP** na porta da API) e, se necessário, encaminhamento de porta / **modo de rede espelhada** do WSL2 — [Networking no WSL](https://learn.microsoft.com/pt-br/windows/wsl/networking).

### API no WSL + login no celular (“sem conexão” com `http://192.168…:8085`)

O Nest roda **dentro do WSL**. O IP `192.168.x.x` é o **Windows** na Wi‑Fi. Por padrão, o Windows **não repassa** o tráfego da porta **8085** da LAN até o processo no WSL — o app no celular falha com erro de rede.

**Solução rápida:** abra o **Windows PowerShell como administrador** (botão direito no menu Iniciar → “Executar como administrador”). O `netsh` **só funciona elevado**.

**Ordem importa:** primeiro entre na pasta do script; **só depois** rode `.\forward-api-from-windows.ps1`. Se você estiver em `C:\Windows\system32` e rodar `.\forward-api-from-windows.ps1` sem `cd`, o PowerShell **não acha** o arquivo (ele não está nessa pasta).

Repo no WSL (troque `thiagows72` pelo seu usuário Linux, se for outro):

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
cd "\\wsl$\Ubuntu\home\thiagows72\efl-brazil\efl-api\scripts"
.\forward-api-from-windows.ps1
```

**Alternativa em uma linha** (também como Admin), sem `cd`:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
& "\\wsl$\Ubuntu\home\thiagows72\efl-brazil\efl-api\scripts\forward-api-from-windows.ps1"
```

Se o Windows reclamar de script em caminho de rede (`\\wsl$\...`), copie `forward-api-from-windows.ps1` para `C:\Temp\`, abra o PowerShell **como Admin**, `cd C:\Temp` e rode `.\forward-api-from-windows.ps1`.

O script cria **portproxy** (`0.0.0.0:8085` → IP do WSL:8085) e uma regra de **firewall** para TCP 8085. Depois teste no Windows: `Invoke-WebRequest http://127.0.0.1:8085/ -UseBasicParsing`.

Reexecute o script quando o **IP do WSL** mudar (ex.: após `wsl --shutdown`). Alternativa: **rede espelhada** do WSL2 ou expor a API com **ngrok** e usar a URL HTTPS no `EXPO_PUBLIC_API_URL`.

### Android / Expo Go: `java.io.IOException: Failed to download remote update`

No **Expo Go**, essa mensagem quase sempre significa: o app **não conseguiu baixar** o manifest ou o **bundle JavaScript** do servidor de desenvolvimento (Metro), **não** é um “OTA update” da loja a menos que você use **EAS Update** em build próprio (neste MVP em Go, é o download do **dev server**).

Tente nesta ordem:

1. **Mesma rede estável** — Wi‑Fi ok; desative **VPN** no celular e no PC (VPN costuma bloquear túnel/ngrok).
2. No PC, suba de novo com cache limpo: **`npm run start:clear`** (equivale a `expo start --tunnel --clear`).
3. No **Expo Go**: feche o app por completo, em **Configurações** limpe cache de projetos recentes (ou reinstale o Expo Go) e escaneie o QR de novo **depois** de aparecer **Tunnel ready** no terminal.
4. Se estiver em **dados móveis** no celular, o túnel pode falhar — teste só em **Wi‑Fi** primeiro.
5. **Alternativa com USB (Android):** com depuração USB ativa, `adb reverse tcp:8081 tcp:8081` e então `npm run start:localhost` — o celular usa `localhost:8081` tunelado pelo cabo até o Metro no PC (útil quando operadora/firewall bloqueia o túnel).

---

## 10. Checklist rápido

- [ ] Node 20 ativo (`node -v`).
- [ ] `npm install` em `efl-api` e em `efl-app`.
- [ ] API sobe com `npm run start:dev` e porta conhecida.
- [ ] `EXPO_PUBLIC_API_URL` definido ao subir o Expo (se for testar integração).
- [ ] `npm run start` no `efl-app` e abrir no **Expo Go** / **Android** / **web**.

Quando forem publicar na Play Store, o próximo passo natural é configurar **`eas build`** e perfis no **EAS**; isso pode ser acrescentado neste guia quando o `eas.json` estiver no repositório.
