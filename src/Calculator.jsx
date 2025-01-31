import React, { useState, useEffect } from "react";
import axios from "axios";

const Calculator = () => {
  // Base de dados de imagens clássicas

  const images = [
    {
      name: "Barbara",
      src: "/assets/barbara.jpg",
      src_flask: "./assets/barbara.jpg",
    },
    {
      name: "Boat",
      src: "/assets/boat.jpg",
      src_flask: "./assets/boat.jpg",
    },
    {
      name: "Clock",
      src: "/assets/clock.jpg",
      src_flask: "./assets/clock.jpg",
    },
    {
      name: "Elaine",
      src: "/assets/elaine.jpg",
      src_flask: "./assets/elaine.jpg",
    },
    {
      name: "Goldhill",
      src: "/assets/goldhill.jpg",
      src_flask: "./assets/goldhill.jpg",
    },
    {
      name: "Lena",
      src: "/assets/lena.jpg",
      src_flask: "./assets/lena.jpg",
    },
    {
      name: "Mandril",
      src: "/assets/mandril.jpg",
      src_flask: "./assets/mandril.jpg",
    },
    {
      name: "Peppers",
      src: "/assets/peppers.jpg",
      src_flask: "./assets/peppers.jpg",
    },
    {
      name: "Tiffany",
      src: "/assets/tiffany.jpg",
      src_flask: "./assets/tiffany.jpg",
    },
  ];

  // Base de Dados de Coeficientes

  const coeffs = [
    { amount: 1 },
    { amount: 3 },
    { amount: 5 },
    { amount: 10 },
    { amount: 20 },
  ];

  // Base de Dados de Tamanho de Bloco

  const block_sizes = [
    { size: 4, label: "4x4" },
    { size: 8, label: "8x8" },
    { size: 10, label: "16x16" },
    { size: 20, label: "32x32" },
    { size: 128, label: "128x128" },
    { size: 256, label: "256x256" },
  ];

  // Base de Dados de Bandas

  const bands = [
    { option: 1, level: 1, label: "Coef. de Aproximação" },
    { option: 2, level: 1, label: "Coef. de Detalhe H" },
    { option: 3, level: 1, label: "Coef. de Detalhe V" },
    { option: 4, level: 1, label: "Coef. de Detalhe D" },
    { option: 5, level: 1, label: "CA + CDH" },
    { option: 6, level: 1, label: "CA + CDV" },
    { option: 7, level: 1, label: "CA + CDD" },
    { option: 8, level: 1, label: "Todas Sub-bandas" },
    { option: 9, level: 2, label: "Coef. de Aproximação" },
    { option: 10, level: 2, label: "CA + Coefs de Detalhe N2." },
    { option: 11, level: 2, label: "Todas Sub-bandas" },
  ];

  // Quantidade de Níveis

  const levels = [
    { option: 1, label: "1 Nível" },
    { option: 2, label: "2 Níveis" },
  ];

  // Variáveis

  const [image, setImage] = useState(images[0]);
  const [compressedImage, setCompressedImage] = useState(null);
  const [imageDWT, setImageDWT] = useState(images[0]);
  const [compressedImageDWT, setCompressedImageDWT] = useState(null);
  const [amountOfCoeffs, setAmountOfCoeffs] = useState(coeffs[0].amount);
  const [option, setOption] = useState(bands[0].option);
  const [blockSize, setBlockSize] = useState(block_sizes[0].size);
  const [level, setLevel] = useState(levels[0].option);

  const [mse, setMse] = useState("");
  const [ssim, setSsim] = useState("");
  const [psnr, setPsnr] = useState("");

  const [mseDWT, setMseDWT] = useState("");
  const [ssimDWT, setSsimDWT] = useState("");
  const [psnrDWT, setPsnrDWT] = useState("");

  // Função para selecionar a imagem a sofrer compressão

  const handleImageChange = (event) => {
    const selectedName = event.target.value;
    const selectedImage = images.find((image) => image.name === selectedName);
    setCompressedImage("");
    setImage(selectedImage ? selectedImage : images[0]);
  };

  const handleImageChangeDWT = (event) => {
    const selectedName = event.target.value;
    const selectedImage = images.find((image) => image.name === selectedName);
    setCompressedImageDWT("");
    setImageDWT(selectedImage ? selectedImage : images[0]);
  };

  // Função para selecionar a quantidade de coeficientes a serem mantidos

  const handleKeepCoeffsChange = (event) => {
    const selectedAmountOfCoeffs = parseInt(event.target.value);
    const selectedCoeffs = coeffs.find(
      (coeff) => coeff.amount === selectedAmountOfCoeffs
    );
    setAmountOfCoeffs(selectedCoeffs.amount);
  };

  const handleKeepOptionChange = (event) => {
    const selectedOption = parseInt(event.target.value);
    const selectedBandOption = bands.find(
      (band) => band.option === selectedOption
    );
    setOption(selectedBandOption.option);
  };

  const handleKeepLevelChange = (event) => {
    const selectedOption = parseInt(event.target.value);
    const selectedLevelOption = levels.find(
      (level) => level.option === selectedOption
    );
    if (selectedLevelOption.option === 1) {
      setOption(bands[0].option);
    } else {
      setOption(bands[8].option);
    }
    setCompressedImageDWT("");
    setLevel(selectedLevelOption.option);
  };

  const handleBlockSizeChange = (event) => {
    const selectedBlockSize = parseInt(event.target.value);
    const selectedBlockSizeFilter = block_sizes.find(
      (block_size) => block_size.size === selectedBlockSize
    );
    setBlockSize(selectedBlockSizeFilter.size);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!image) {
      alert("Por favor, selecione uma imagem.");
      return;
    }

    if (amountOfCoeffs > blockSize * blockSize) {
      alert(
        "Por favor, selecione um valor de coeficientes menor do que " +
          blockSize * blockSize
      );
      return;
    }

    console.log(image);
    console.log(amountOfCoeffs);
    console.log(blockSize);

    try {
      const imageResponse = await axios.post(
        "https://dct-compress-backend.onrender.com/calculate",
        {
          image: image.src_flask,
          amount_of_coeffs: amountOfCoeffs,
          block_size: blockSize,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          responseType: "blob",
        }
      );
      // Sucesso
      const imageUrl = URL.createObjectURL(imageResponse.data);
      setCompressedImage(imageUrl);
    } catch (error) {
      console.error("Erro ao enviar a imagem:", error.message);
    }

    try {
      const metricsResponse = await axios.post(
        "https://dct-compress-backend.onrender.com/get_metrics",
        {
          image: image.src_flask,
          amount_of_coeffs: amountOfCoeffs,
          block_size: blockSize,
        }
      );
      console.log(metricsResponse.data.mse);
      setMse(metricsResponse.data.mse.toFixed(2));
      setSsim(metricsResponse.data.ssim.toFixed(2));
      setPsnr(metricsResponse.data.psnr.toFixed(2));
    } catch (error) {
      console.error("Erro ao enviar a imagem:", error.message);
    }
  };

  const handleSubmitDWT = async (event) => {
    event.preventDefault();
    if (!imageDWT) {
      alert("Por favor, selecione uma imagem.");
      return;
    }

    // ALGUMA VALIDAÇÃO

    console.log(imageDWT);

    try {
      const imageResponse = await axios.post(
        "https://dct-compress-backend.onrender.com/calculate_dwt",
        {
          image: imageDWT.src_flask,
          option: option,
          level: level,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          responseType: "blob",
        }
      );
      // Sucesso
      const imageUrl = URL.createObjectURL(imageResponse.data);
      setCompressedImageDWT(imageUrl);
    } catch (error) {
      console.error("Erro ao enviar a imagem:", error.message);
    }

    try {
      const metricsResponse = await axios.post(
        "https://dct-compress-backend.onrender.com/get_metrics_dwt",
        {
          image: imageDWT.src_flask,
          option: option,
          level: level,
        }
      );
      setMseDWT(metricsResponse.data.mse.toFixed(2));
      setSsimDWT(metricsResponse.data.ssim.toFixed(2));
      setPsnrDWT(metricsResponse.data.psnr.toFixed(2));
    } catch (error) {
      console.error("Erro ao enviar a imagem:", error.message);
    }
  };

  useEffect(() => {
    fetch("https://dct-compress-backend.onrender.com/")
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => console.error("Erro ao buscar dados:", error));
  }, []);

  return (
    <div>
      {/* HEADER */}
      <h2 className="title">Transformada DCT</h2>
      <h4 className="subheader">
        Uma ferramenta para visualizar a ação da transformada DCT na compressão
        de imagens!
      </h4>

      {/* SELECTION OF PARAMETERS */}
      <form className="user-params">
        <div className="image-selection">
          <p>Selecione a imagem</p>
          <select onChange={handleImageChange}>
            {images.map((image) => (
              <option key={image.name} value={image.name}>
                {image.name}
              </option>
            ))}
          </select>
        </div>
        <div className="image-selection">
          <p>Quantidade de Coeficientes</p>
          <select onChange={handleKeepCoeffsChange}>
            {coeffs.map((coeff) => (
              <option key={coeff.amount} value={coeff.amount}>
                {coeff.amount}
              </option>
            ))}
          </select>
        </div>
        <div className="image-selection">
          <p>Tamanho do Bloco</p>
          <select onChange={handleBlockSizeChange}>
            {block_sizes.map((block_size) => (
              <option key={block_size.size} value={block_size.size}>
                {block_size.label}
              </option>
            ))}
          </select>
        </div>
        <div className="image-selection">
          <p>Confirmar</p>
          <button onClick={handleSubmit}>Confirmar</button>
        </div>
      </form>

      {/* PREVIEW */}
      <div className="compress">
        <div className="original">
          <h4>Imagem Original</h4>
          <img className="original-image" src={image.src} alt="" />
        </div>
        <div className="compressed">
          <h4>Imagem com Compressão</h4>
          {compressedImage ? (
            <img src={compressedImage} alt="compressed-image" />
          ) : (
            <div
              style={{ background: "#fafafa", width: "256px", height: "256px" }}
            ></div>
          )}
        </div>
      </div>
      <div className="metrics">
        <h3>Métricas</h3>
        <div className="values">
          <h4>MSE: {mse}</h4>
          <h4>SSIM: {ssim}</h4>
          <h4>PSNR: {psnr}</h4>
        </div>
      </div>

      {/* HEADER */}
      <h2 className="title">Transformada DWT</h2>
      <h4 className="subheader">
        Uma ferramenta para visualizar a ação da transformada DWT na compressão
        de imagens!
      </h4>

      <form className="user-params">
        <div className="image-selection">
          <p>Selecione a imagem</p>
          <select onChange={handleImageChangeDWT}>
            {images.map((image) => (
              <option key={image.name} value={image.name}>
                {image.name}
              </option>
            ))}
          </select>
        </div>
        <div className="image-selection">
          <p>Níveis</p>
          <select onChange={handleKeepLevelChange}>
            {levels.map((level) => (
              <option key={level.option} value={level.option}>
                {level.label}
              </option>
            ))}
          </select>
        </div>
        <div className="image-selection">
          <p>Sub-bandas</p>
          <select onChange={handleKeepOptionChange}>
            {bands
              .filter((band) => band.level === level)
              .map((band) => (
                <option key={band.option} value={band.option}>
                  {band.label}
                </option>
              ))}
          </select>
        </div>
        <div className="image-selection">
          <p>Confirmar</p>
          <button onClick={handleSubmitDWT}>Confirmar</button>
        </div>
      </form>

      {/* PREVIEW */}
      <div className="compress">
        <div className="original">
          <h4>Imagem Original</h4>
          <img className="original-image" src={imageDWT.src} alt="" />
        </div>
        <div className="compressed">
          <h4>Imagem com Compressão</h4>
          {compressedImageDWT ? (
            <img src={compressedImageDWT} alt="compressed-image" />
          ) : (
            <div
              style={{ background: "#fafafa", width: "256px", height: "256px" }}
            ></div>
          )}
        </div>
      </div>
      <div className="metrics">
        <h3>Métricas</h3>
        <div className="values">
          <h4>MSE: {mseDWT}</h4>
          <h4>SSIM: {ssimDWT}</h4>
          <h4>PSNR: {psnrDWT}</h4>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
