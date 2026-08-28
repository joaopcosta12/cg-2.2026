<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Desenhos WebGL 2</title>
    <style>
        body {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #ffffff; /* Fundo totalmente branco */
            margin: 0;
            gap: 20px;
        }
        canvas {
            background-color: #ffffff;
            border: none; /* Sem moldura */
        }
    </style>
</head>
<body>

    <canvas id="canvas-flor" width="300" height="300"></canvas>
    <canvas id="canvas-robo" width="300" height="300"></canvas>
    <canvas id="canvas-carro" width="300" height="300"></canvas>

    <script src="flor.js"></script>
    <script src="robo.js"></script>
    <script src="carro.js"></script>

</body>
</html>
