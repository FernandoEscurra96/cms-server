const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Producto por defecto
let productData = {
    category: "Smartphone Premium",
    title: "iPhone 15 Pro Max",
    description: "Experimenta el futuro en tus manos con el smartphone más avanzado. Chip A17 Pro revolucionario, sistema de cámaras profesional de 48MP y pantalla Super Retina XDR de 6.7 pulgadas que redefine la excelencia.",
    priceOriginal: "$1,299",
    priceCurrent: "$1,199",
    priceDiscount: "-8%",
    buyLink: "https://www.ejemplo.com/comprar-iphone"
};

// Endpoint para obtener el producto
app.get('/api/product', (req, res) => {
    res.json(productData);
});

// Endpoint para actualizar el producto
app.post('/api/product', (req, res) => {
    const newData = req.body;

    // Validar que los campos existen (opcional)
    productData = { ...productData, ...newData };

    res.json({ message: "Producto actualizado", productData });
});

// Servir HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});




// Minificar CSS en <style>...</style>
function minifyCss(html) {
    return html.replace(/<style>([\s\S]*?)<\/style>/gi, (match, css) => {
        // Eliminar saltos de línea y espacios innecesarios
        let minified = css
            .replace(/\s+/g, ' ')          // Quitar espacios múltiples
            .replace(/\s*{\s*/g, '{')      // Espacios antes/después de {
            .replace(/\s*}\s*/g, '}')      // Espacios antes/después de }
            .replace(/\s*:\s*/g, ':')      // Espacios antes/después de :
            .replace(/\s*;\s*/g, ';')      // Espacios antes/después de ;
            .replace(/;}/g, '}');          // Quitar ; innecesarios antes de }
        return `<style>${minified}</style>`;
    });
}

// Endpoint para obtener HTML con datos incrustados
// Endpoint para obtener HTML con datos incrustados (sin JS)
app.get('/api/html', (req, res) => {
    const htmlPath = path.join(__dirname, 'public/index.html');
    console.log("api/html");
    console.log(htmlPath);
    fs.readFile(htmlPath, 'utf8', (err, html) => {
        if (err) {
            return res.status(500).json({ error: "No se pudo leer el archivo HTML" });
        }
        console.log(html);
        // Reemplazar los placeholders directamente con datos del producto

        let cleanHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
        cleanHtml = minifyCss(cleanHtml);

        let finalHtml = cleanHtml
            .replace('<div class="product-category"></div>', `<div class="product-category">${productData.category}</div>`)
            .replace('<h1 class="product-title"></h1>', `<h1 class="product-title">${productData.title}</h1>`)
            .replace('<p class="product-description"></p>', `<p class="product-description">${productData.description}</p>`)
            .replace('<span class="price-original"></span>', `<span class="price-original">${productData.priceOriginal}</span>`)
            .replace('<span class="price-current"></span>', `<span class="price-current">${productData.priceCurrent}</span>`)
            .replace('<span class="price-discount"></span>', `<span class="price-discount">${productData.priceDiscount}</span>`)
            .replace('<button class="buy-button">Comprar Ahora</button>', 
                     `<a href="${productData.buyLink}" class="buy-button">Comprar Ahora</a>`);

        // Retornar solo HTML dentro del JSON
        res.json({ html: finalHtml });
    });
});








// ================================
// COMPETITOR DATA (index2.html)
// ================================
let competitorData = {
  competitors: [
    {
      letter: "A",
      name: "COMPETIDOR A",
      question: "¿Por qué pierde?",
      stats: [
        "Batería térmica real 40% menor en tests independientes: tras 4h en oficina, el agua ya cae a temperatura ambiente",
        "Su mayor pecado: 31% de reviewers en Amazon reportan fugas tras 3 semanas",
        "Plástico reciclado de baja calidad, sin certificado BPA",
        "1 de cada 9 unidades presenta defectos de fabricación (Amazon US, abril 2024)",
        "Cuesta $20 menos, pero a los 9 meses el gasto en repuestos y absorción de olores triplica el 'ahorro' inicial"
      ]
    },
    {
      letter: "B",
      name: "COMPETIDOR B",
      question: "¿Por qué es una trampa?",
      stats: [
        "Texto ejemplo B1",
        "Texto ejemplo B2"
      ]
    }
  ]
};



// ================================
// ENDPOINTS COMPETIDORES (index2)
// ================================

// Endpoint para obtener todos los competidores
app.get('/api/competitors', (req, res) => {
    res.json(competitorData);
});

// Endpoint para actualizar todos los competidores
app.post('/api/competitors', (req, res) => {
    const newData = req.body;

    // Validar que venga la estructura correcta (opcional)
    if (!newData.competitors || !Array.isArray(newData.competitors)) {
        return res.status(400).json({ error: "El JSON debe incluir un array 'competitors'" });
    }

    competitorData = { ...competitorData, ...newData };

    res.json({ message: "Competidores actualizados", competitorData });
});
