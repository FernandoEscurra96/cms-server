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



// Endpoint para devolver el HTML de index2.html con los competidores incrustados
app.get('/api/html2', (req, res) => {
    const htmlPath = path.join(__dirname, 'public/index2.html');
    console.log("api/html2");
    console.log(htmlPath);

    fs.readFile(htmlPath, 'utf8', (err, html) => {
        if (err) {
            return res.status(500).json({ error: "No se pudo leer el archivo index2.html" });
        }

        // 1. Remover cualquier <script> ... </script>
        let cleanHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

        // 2. Minificar CSS en una sola línea
        cleanHtml = minifyCss(cleanHtml);

        // 3. Renderizar competidores con datos JSON
        let competitorsHtml = competitorData.competitors.map(comp => `
            <div class="competitor-section">
                <div class="competitor-content">
                    <div class="competitor-header">
                        <div class="competitor-letter">${comp.letter}</div>
                        <h3 class="competitor-name">${comp.name}</h3>
                        <p class="competitor-question">${comp.question}</p>
                    </div>
                    <div class="stats-container">
                        <div class="stat-block">
                            ${comp.stats.map(stat => `<p class="stat-text">${stat}</p>`).join("")}
                        </div>
                    </div>
                </div>
            </div>
        `).join("");

        // 4. Reemplazar el contenido de .analysis-section
        let finalHtml = cleanHtml.replace(
            /<section class="analysis-section">[\s\S]*<\/section>/,
            `<section class="analysis-section">
                <div class="section-intro">
                    <h2 class="section-title">ANÁLISIS DEVASTADOR</h2>
                    <p class="section-subtitle">Datos reales que revelan por qué la competencia fracasa estrepitosamente</p>
                </div>
                ${competitorsHtml}
            </section>`
        );

        // 5. Retornar solo HTML dentro de JSON
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




// ==============================
// Datos iniciales FAQ + Introduction
// ==============================
let faqData = {
    introduction: {
        title: "Productos Premium",
        subtitle: "JSON Descubre nuestra colección exclusiva de productos diseñados para elevar tu experiencia",
        ctaText: "Comprar Ahora",
        ctaLink: "#productos"
    },
    title: "Preguntas Frecuentes",
    faqs: [
        {
            question: "¿Es realmente tan fácil de limpiar como promete?",
            answer: "Sí, la Owala FreeSip Insulated 2025 fue diseñada para facilitar una higiene total. Todas las partes principales pueden desmontarse fácilmente y colocarse en el lavavajillas sin riesgo de deformación."
        },
        {
            question: "¿Cómo funciona exactamente la boquilla FreeSip?",
            answer: "La boquilla FreeSip permite beber de dos formas: inclinar la botella para grandes sorbos a través de una abertura ancha, o mantenerla vertical y sorber a través del popote integrado."
        }
    ]
};

// ==============================
// Endpoint para obtener FAQs
// ==============================
app.get('/api/faq', (req, res) => {
    res.json(faqData);
});

// ==============================
// Endpoint para actualizar FAQs + Introduction
// ==============================
app.post('/api/faq', (req, res) => {
    const newData = req.body;

    // Validar que existan las FAQs
    if (!newData.faqs || !Array.isArray(newData.faqs)) {
        return res.status(400).json({ error: "El JSON debe incluir un array 'faqs'" });
    }

    // Mezclar data nueva con la existente
    faqData = { ...faqData, ...newData };

    res.json({ message: "FAQ actualizado", faqData });
});



app.get('/api/html3', (req, res) => {
    const htmlPath = path.join(__dirname, 'public/index3.html');
    console.log("api/html3");

    fs.readFile(htmlPath, 'utf8', (err, html) => {
        if (err) {
            return res.status(500).json({ error: "No se pudo leer el archivo index3.html" });
        }

        // 1. Remover <script> ... </script>
        let cleanHtml = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

        // 2. Minificar CSS
        cleanHtml = minifyCss(cleanHtml);

        // 3. Renderizar Introducción
        let introSection = `
            <section class="introduction">
                <div class="introduction-content">
                    <h1>${faqData.introduction.title}</h1>
                    <p>${faqData.introduction.subtitle}</p>
                    <a href="${faqData.introduction.ctaLink}" class="cta-button">
                        ${faqData.introduction.ctaText}
                    </a>
                </div>
            </section>
        `;

        cleanHtml = cleanHtml.replace(
            /<section class="introduction">[\s\S]*?<\/section>/,
            introSection
        );

        // 4. Renderizar FAQs
        let faqItems = faqData.faqs.map(faq => `
            <details class="faq-item">
                <summary class="faq-question">${faq.question}</summary>
                <div class="faq-answer">${faq.answer}</div>
            </details>
        `).join("");

        let faqSection = `
            <section class="faq-section">
                <div class="container">
                    <h2 class="section-title">${faqData.title}</h2>
                    <div class="row">
                        <div class="col-lg-10 mx-auto">
                            ${faqItems}
                        </div>
                    </div>
                </div>
            </section>
        `;

        cleanHtml = cleanHtml.replace(
            /<section class="faq-section">[\s\S]*<\/section>/,
            faqSection
        );

        // 5. Retornar solo HTML dentro del JSON
        res.json({ html: cleanHtml });
    });
});