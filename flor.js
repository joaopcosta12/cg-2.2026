{
    const canvas = document.getElementById("canvas-flor");
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

    // --- CONSTRUÇÃO DA FLOR (ESTRUTURA GEOMÉTRICA SEM SOBREPOSIÇÃO) ---

    // 1. O Miolo (Hexágono Amarelo construído com 1 retângulo central e 2 triângulos laterais)
    // Retângulo central (Vai de Y=0.5 até Y=0.1)
    addRectangle(-0.1, 0.5, 0.2, 0.4, 1.0, 0.8, 0.0);
    
    // Triângulo esquerdo do hexágono (Ponta em X=-0.2)
    addTriangle(-0.1, 0.5, -0.2, 0.3, -0.1, 0.1, 1.0, 0.8, 0.0);
    
    // Triângulo direito do hexágono (Ponta em X=0.2)
    addTriangle( 0.1, 0.5,  0.2, 0.3,  0.1, 0.1, 1.0, 0.8, 0.0);

    // 2. As Pétalas (5 Triângulos Rosa que se ligam exatamente às bordas do hexágono)
    // Pétala 1 (Topo: Encosta na linha Y=0.5)
    addTriangle(-0.1, 0.5, 0.1, 0.5, 0.0, 0.8, 1.0, 0.3, 0.6);
    
    // Pétala 2 (Topo-Direita: Encosta na linha inclinada direita)
    addTriangle( 0.1, 0.5, 0.2, 0.3, 0.5, 0.6, 1.0, 0.3, 0.6);
    
    // Pétala 3 (Baixo-Direita: Encosta na linha inclinada direita)
    addTriangle( 0.2, 0.3, 0.1, 0.1, 0.5, 0.0, 1.0, 0.3, 0.6);
    
    // Pétala 4 (Baixo-Esquerda: Encosta na linha inclinada esquerda)
    addTriangle(-0.1, 0.1, -0.2, 0.3, -0.5, 0.0, 1.0, 0.3, 0.6);
    
    // Pétala 5 (Topo-Esquerda: Encosta na linha inclinada esquerda)
    addTriangle(-0.2, 0.3, -0.1, 0.5, -0.5, 0.6, 1.0, 0.3, 0.6);

    // 3. O Caule (Retângulo Verde Escuro)
    // O hexágono termina exatamente em Y=0.1. O caule começa aí e desce.
    // A largura bate perfeitamente com a base do miolo (de X=-0.1 a X=0.1)
    addRectangle(-0.1, 0.1, 0.2, 0.9, 0.0, 0.6, 0.2); 

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
