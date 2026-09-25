// ==================================================
// CLASS - SCENE
// ==================================================

class Scene {

    constructor(gl, program) {

        this.renderer = new Renderer(gl, program);

        // Figuras que serão exibidas
        this.helicopterBody = new HelicopterBody();
        this.helicopterTopShaft = new HelicopterTopShaft();
        this.helicopterTail = new HelicopterTail();
        this.helicopterPropellers = new HelicopterPropellers();
        this.helicopterTailPropeller = new HelicopterTailPropeller();

        // Variáveis de controle de movimento e animação
        this.propellerTheta = 0.0;
        this.posX = 0.0;
        this.posY = 0.0;
        this.speed = 0.02;
        this.keys = {};

        // Listeners para as setas do teclado
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    }

    update() {
        // Atualiza a posição do helicóptero baseada nas setas do teclado
        if (this.keys['ArrowUp']) this.posY += this.speed;
        if (this.keys['ArrowDown']) this.posY -= this.speed;
        if (this.keys['ArrowRight']) this.posX += this.speed;
        if (this.keys['ArrowLeft']) this.posX -= this.speed;

        // Rotação contínua das hélices
        this.propellerTheta += 0.2;

        // Transformação base para as partes estáticas do helicóptero
        let baseTransform = m4.translation(this.posX, this.posY, 0.0);

        this.helicopterBody.update(baseTransform);
        this.helicopterTopShaft.update(baseTransform);
        this.helicopterTail.update(baseTransform);

        // Hélice superior: Rotaciona no próprio eixo Y e translada para a posição do helicóptero
        let topPropTransform = m4.yRotation(this.propellerTheta);
        topPropTransform = m4.translate(topPropTransform, this.posX, this.posY, 0.0);
        this.helicopterPropellers.update(topPropTransform);

        // Hélice da cauda: Translada para a origem (x=-0.7), rotaciona em Z, desfaz o offset (x=0.7) e translada para o helicóptero
        let tailPropTransform = m4.translation(-0.7, 0.0, 0.0);
        tailPropTransform = m4.zRotate(tailPropTransform, this.propellerTheta);
        tailPropTransform = m4.translate(tailPropTransform, 0.7, 0.0, 0.0);
        tailPropTransform = m4.translate(tailPropTransform, this.posX, this.posY, 0.0);
        this.helicopterTailPropeller.update(tailPropTransform);
    }

    draw() {

        gl.clear(
            gl.COLOR_BUFFER_BIT |
            gl.DEPTH_BUFFER_BIT
        );

        gl.useProgram(program);

        this.helicopterBody.draw(this.renderer);
        this.helicopterTopShaft.draw(this.renderer);
        this.helicopterTail.draw(this.renderer);
        this.helicopterPropellers.draw(this.renderer);
        this.helicopterTailPropeller.draw(this.renderer);
    }

    execute() {

        this.update();
        this.draw();

        requestAnimationFrame(
            () => this.execute()
        );
    }

    init() {

        requestAnimationFrame(
            () => this.execute()
        );
    }
}