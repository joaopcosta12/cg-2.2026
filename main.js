const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}

// --------------------------------------------------
// VERTICES E CORES
// --------------------------------------------------

function verticesBarra(){
    return new Float32Array([
        -0.05,  0.2,
        -0.05, -0.2,
         0.05,  0.2,
         0.05,  0.2,
        -0.05, -0.2,
         0.05, -0.2
    ]);
}

function verticesBola(){
    let vertices = [];
    let numSegments = 30;
    let radius = 0.05;

    for (let i = 0; i < numSegments; i++) {
        let theta1 = (i / numSegments) * 2 * Math.PI;
        let theta2 = ((i + 1) / numSegments) * 2 * Math.PI;

        vertices.push(0, 0); // Center of the circle
        vertices.push(radius * Math.cos(theta1), radius * Math.sin(theta1));
        vertices.push(radius * Math.cos(theta2), radius * Math.sin(theta2));
    }

    return new Float32Array(vertices);
}

let verticesBarraDireita = verticesBarra();
let corBarraDireita = new Float32Array([0.0, 0.0, 1.0]);

let verticesBarraEsquerda = verticesBarra();
let corBarraEsquerda = new Float32Array([0.0, 1.0, 0.0]);

let verticesBolaCentro = verticesBola();
let corBolaCentro = new Float32Array([1.0, 0.0, 0.0]);

// --------------------------------------------------
// CONTROLES DO TECLADO (ADICIONADO)
// --------------------------------------------------
const keys = {};

window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});

window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

// --------------------------------------------------
// TRANSFORMAÇÕES INICIAIS
// --------------------------------------------------

let MbarraEsquerda = m3.translation(-0.9, 0.0);
let MbarraDireita = m3.translation(0.9, 0.0);
let MbolaCentro = m3.identity();

// --------------------------------------------------
// BUFFER E SHADERS (MANTIDO DO ORIGINAL)
// --------------------------------------------------

const verticesBuffer = gl.createBuffer();

const vertexShaderSource = `#version 300 es
in vec2 aPosition;
uniform mat3 u_transform;
out vec3 vColor;

void main() {
    vec3 position = u_transform * vec3(aPosition, 1.0);
    gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const fragmentShaderSource = `#version 300 es
precision mediump float;
uniform vec3 uColor;
out vec4 outColor;

void main() {
    outColor = vec4(uColor, 1.0);
}
`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const error = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error(error);
    }
    return shader;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
}

const positionLocation = gl.getAttribLocation(program, "aPosition");
const colorLocation = gl.getUniformLocation(program, "uColor");
const transformLocation = gl.getUniformLocation(program, "u_transform");

// --------------------------------------------------
// LIMPAR TELA
// --------------------------------------------------
gl.clearColor(0.1, 0.1, 0.1, 1.0);


// --------------------------------------------------
// DESENHAR
// --------------------------------------------------
const numComponents = 2;

function drawScene(){
    atualizaAnimacao();

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    
    drawBarraEsquerda();
    drawBarraDireita();
    drawBolaCentro();
    
    requestAnimationFrame(drawScene);
}

function drawBarraEsquerda(){
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesBarraEsquerda, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform3fv(colorLocation, corBarraEsquerda);
    gl.uniformMatrix3fv(transformLocation, false, MbarraEsquerda);
    gl.drawArrays(gl.TRIANGLES, 0, verticesBarraEsquerda.length / numComponents);
}

function drawBarraDireita(){
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesBarraDireita, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform3fv(colorLocation, corBarraDireita);
    gl.uniformMatrix3fv(transformLocation, false, MbarraDireita);
    gl.drawArrays(gl.TRIANGLES, 0, verticesBarraDireita.length / numComponents);
}

function drawBolaCentro(){
    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesBolaCentro, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform3fv(colorLocation, corBolaCentro);
    gl.uniformMatrix3fv(transformLocation, false, MbolaCentro);
    gl.drawArrays(gl.TRIANGLES, 0, verticesBolaCentro.length / numComponents);
}

// --------------------------------------------------
// PARÂMETROS ANIMAÇÃO E LÓGICA DO JOGO
// --------------------------------------------------

let tyBE = 0.0;
let tyBD = 0.0;
const velocidadeBarra = 0.03;

let txBola = 0.0;
let tyBola = 0.0;
let txBola_offset = 0.015;
let tyBola_offset = 0.01;
const raioBola = 0.05;

// VARIÁVEIS DE PLACAR
let placarEsquerda = 0;
let placarDireita = 0;
const htmlPlacarP1 = document.getElementById("pontosP1");
const htmlPlacarP2 = document.getElementById("pontosP2");

function atualizaAnimacao(){
    
    // 1. Movimento das Barras com o Teclado
    if (keys["w"] || keys["W"]) tyBE += velocidadeBarra;
    if (keys["s"] || keys["S"]) tyBE -= velocidadeBarra;
    if (keys["ArrowUp"]) tyBD += velocidadeBarra;
    if (keys["ArrowDown"]) tyBD -= velocidadeBarra;

    // Limitar as barras
    if (tyBE > 0.8) tyBE = 0.8;
    if (tyBE < -0.8) tyBE = -0.8;
    if (tyBD > 0.8) tyBD = 0.8;
    if (tyBD < -0.8) tyBD = -0.8;

    MbarraEsquerda = m3.translation(-0.9, tyBE);
    MbarraDireita = m3.translation(0.9, tyBD);

    // 2. Movimento da Bola
    txBola += txBola_offset;
    tyBola += tyBola_offset;

    // Colisão com o Teto e o Chão
    if(tyBola + raioBola > 1.0 || tyBola - raioBola < -1.0) {
        tyBola_offset = -tyBola_offset;
    }

    // 3. Colisão com a Barra Esquerda
    if (txBola - raioBola < -0.85 && txBola + raioBola > -0.95) {
        if (tyBola + raioBola > tyBE - 0.2 && tyBola - raioBola < tyBE + 0.2) {
            if (txBola_offset < 0) { 
                txBola_offset = -txBola_offset; 
                txBola = -0.85 + raioBola; 
            }
        }
    }

    // 4. Colisão com a Barra Direita
    if (txBola + raioBola > 0.85 && txBola - raioBola < 0.95) {
        if (tyBola + raioBola > tyBD - 0.2 && tyBola - raioBola < tyBD + 0.2) {
            if (txBola_offset > 0) { 
                txBola_offset = -txBola_offset; 
                txBola = 0.85 - raioBola; 
            }
        }
    }

    // 5. MARCAÇÃO DE PONTO E PLACAR
    if(txBola > 1.0) {
        // Bola passou da direita: Ponto para a Esquerda
        placarEsquerda++;
        resetarRodada();
    } else if (txBola < -1.0) {
        // Bola passou da esquerda: Ponto para a Direita
        placarDireita++;
        resetarRodada();
    }

    // Atualizar matriz de transformação da bola
    MbolaCentro = m3.translation(txBola, tyBola);
}

// Função para resetar a bola e checar o ganhador
function resetarRodada() {
    // Checa se alguém chegou a 10
    if (placarEsquerda >= 10 || placarDireita >= 10) {
        // Zera os pontos
        placarEsquerda = 0;
        placarDireita = 0;
        
        // (Opcional) Você pode colocar um alert("Fim de Jogo!") aqui se quiser pausar e avisar quem ganhou
    }

    // Atualiza o texto no HTML
    htmlPlacarP1.innerText = placarEsquerda;
    htmlPlacarP2.innerText = placarDireita;

    // Coloca a bola no centro
    txBola = 0.0;
    tyBola = 0.0;
    
    // Inverte o lado para onde a bola vai sair
    txBola_offset = -txBola_offset;
}

// --------------------------------------------------
// INÍCIO DO DESENHO
// --------------------------------------------------
drawScene();
