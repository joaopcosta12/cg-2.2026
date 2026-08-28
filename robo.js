{
    const canvas = document.getElementById("canvas-robo");
    const gl = canvas.getContext("webgl2");
    gl.clearColor(1.0, 1.0, 1.0, 1.0); // Fundo Branco

    const vertexData = [];

    // Função base: Adiciona 1 triângulo
    function addTriangle(x1, y1, x2, y2, x3, y3, r, g, b) {
        vertexData.push(
            x1, y1, r, g, b,
            x2, y2, r, g, b,
            x3, y3, r, g, b
        );
    }

    // Função auxiliar: Adiciona 1 retângulo a partir do canto superior esquerdo
    function addRectangle(x, y, w, h, r, g, b) {
        addTriangle(x, y, x, y - h, x + w, y - h, r, g, b);
        addTriangle(x, y, x + w, y - h, x + w, y, r, g, b);
    }

    // --- CONSTRUÇÃO DO ROBÔ SIMPLIFICADO (SEM SOBREPOSIÇÃO) ---

    // 1. Antena
    // Haste
    addRectangle(-0.02, 0.75, 0.04, 0.15, 0.6, 0.6, 0.6); // Cinza
    // Ponta (Triângulo)
    addTriangle(-0.05, 0.75, 0.05, 0.75, 0.0, 0.85, 1.0, 0.2, 0.2); // Vermelho

    // 2. Cabeça (Apenas 3 blocos empilhados)
    // Topo da Cabeça
    addRectangle(-0.2, 0.6, 0.4, 0.1, 0.7, 0.7, 0.7); // Cinza claro
    // Visor do Olho (Faixa contínua estilo "Ciclope")
    addRectangle(-0.2, 0.5, 0.4, 0.1, 0.0, 1.0, 1.0); // Ciano
    // Queixo/Boca
    addRectangle(-0.2, 0.4, 0.4, 0.1, 0.7, 0.7, 0.7); // Cinza claro

    // 3. Pescoço
    addRectangle(-0.05, 0.3, 0.1, 0.1, 0.3, 0.3, 0.3); // Cinza escuro

    // 4. Corpo (Apenas 2 blocos)
    // Parte de cima (Peitoral)
    addRectangle(-0.3, 0.2, 0.6, 0.2, 0.2, 0.4, 0.8); // Azul
    // Parte de baixo (Abdômen)
    addRectangle(-0.3, 0.0, 0.6, 0.2, 0.6, 0.6, 0.6); // Cinza

    // 5. Braços e Garras (Anexados diretamente às laterais do corpo)
    // Braço Esquerdo
    addRectangle(-0.45, 0.2, 0.15, 0.3, 0.5, 0.5, 0.5); // Cinza
    addTriangle(-0.45, -0.1, -0.3, -0.1, -0.375, -0.3, 1.0, 0.5, 0.0); // Garra Laranja
    
    // Braço Direito
    addRectangle(0.3, 0.2, 0.15, 0.3, 0.5, 0.5, 0.5); // Cinza
    addTriangle(0.3, -0.1, 0.45, -0.1, 0.375, -0.3, 1.0, 0.5, 0.0); // Garra Laranja

    // 6. Pernas
    addRectangle(-0.2, -0.2, 0.1, 0.4, 0.4, 0.4, 0.4); // Perna Esquerda
    addRectangle(0.1, -0.2, 0.1, 0.4, 0.4, 0.4, 0.4);  // Perna Direita

    // 7. Pés (Blocos retangulares simples)
    addRectangle(-0.25, -0.6, 0.15, 0.15, 0.3, 0.3, 0.3); // Pé Esquerdo
    addRectangle(0.1, -0.6, 0.15, 0.15, 0.3, 0.3, 0.3);   // Pé Direito

    // --- FIM DA CONSTRUÇÃO ---

    const vertices = new Float32Array(vertexData);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const vsSource = `#version 300 es
    in vec2 aPosition;
    in vec3 aColor;
    out vec3 vColor;
    void main() { 
        gl_Position = vec4(aPosition, 0.0, 1.0); 
        vColor = aColor; 
    }`;

    const fsSource = `#version 300 es
    precision mediump float;
    in vec3 vColor;
    out vec4 outColor;
    void main() { 
        outColor = vec4(vColor, 1.0); 
    }`;

    function compilarShader(tipo, fonte) {
        const shader = gl.createShader(tipo);
        gl.shaderSource(shader, fonte);
        gl.compileShader(shader);
        return shader;
    }
    
    const program = gl.createProgram();
    gl.attachShader(program, compilarShader(gl.VERTEX_SHADER, vsSource));
    gl.attachShader(program, compilarShader(gl.FRAGMENT_SHADER, fsSource));
    gl.linkProgram(program);

    const posLoc = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 20, 0);

    const colorLoc = gl.getAttribLocation(program, "aColor");
    gl.enableVertexAttribArray(colorLoc);
    gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 20, 8);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.bindVertexArray(vao);
    
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 5); 
}
