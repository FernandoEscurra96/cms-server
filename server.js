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
    console.log(`Servidor corriendo en :${PORT}`);
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
            answer: "Sí, la Owala FreeSip Insulated 2025 fue diseñada para facilitar una higiene total..."
        },
        {
            question: "¿Cómo funciona exactamente la boquilla FreeSip?",
            answer: "La boquilla FreeSip permite beber de dos formas: inclinar la botella..."
        }
    ],
    pricing: {
        title: "Inversión en tu Futuro",
        price: "$299",
        subtitle: "Pago único - Valor de por vida",
        unique_features: [
            "Acceso completo a todas las funciones",
            "Actualizaciones gratuitas de por vida",
            "Soporte prioritario 24/7",
            "Garantía de satisfacción 30 días",
            "Integración con todas las plataformas"
        ],
        ctaText: "Comprar Ahora",
        ctaLink: "#"
    },
    findings: {
        title: "📊 Hallazgos Principales",
        key_findings: [
            "Durante el periodo de prueba de tres meses, el Cecotec Accesorios de Papel para Freidora de Aire Cecofry Paper Pack demostró ser un recurso esencial...",
            "Los usuarios destacaron la versatilidad del producto, utilizándolo no solo para freír, sino también para hornear...",
            "Un hallazgo importante fue la mejora en la conservación de la freidora, ya que el uso regular del papel evitó la acumulación...",
            "En conclusión, el Cecofry Paper Pack superó ampliamente las expectativas en cuanto a limpieza, seguridad y versatilidad..."
        ]
    },
    conclusion: {
        title: "Conclusión",
        text: "El Cecofry Paper Pack se consolida como un accesorio esencial que combina practicidad, sostenibilidad y eficiencia, aportando valor real a la experiencia del usuario. <br> El Cecofry Paper Pack se consolida como un accesorio esencial que combina practicidad, sostenibilidad y eficiencia, aportando valor real a la experiencia del usuario."
    },
    errors: {
        title: "Errores comunes al comprar",
        items: [
        {
            description: "Error 1: No se carga la página",
            consequence: "Verificar conexión\nReiniciar el servidor"
        },
        {
            description: "Error 2: API devuelve 500",
            consequence: "Revisar logs del servidor\nContactar soporte"
        }
    ]
    },
    similar: {
        title: "Productos Similares",
        text: "Explora alternativas que también ofrecen practicidad y sostenibilidad.\nModelos de otras marcas incluyen opciones reutilizables de silicona.\nEstos pueden complementar o reemplazar el uso de papeles desechables."
    }
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



//const fs = require('fs');
//const path = require('path');
const cheerio = require('cheerio');

// Suponiendo que faqData ya está definido con introduction, faqs, pricing, findings, conclusion

app.get('/api/html3', (req, res) => {
    const htmlPath = path.join(__dirname, 'public/index3.html');
    console.log("api/html3");

    fs.readFile(htmlPath, 'utf8', (err, html) => {
        if (err) {
            return res.status(500).json({ error: "No se pudo leer el archivo index3.html" });
        }

        // 1. Remover cualquier <script> ... </script>
        html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

        // 2. Minificar CSS (si tienes función minifyCss)
        html = minifyCss(html);

        // 3. Cargar HTML en Cheerio
        const $ = cheerio.load(html);

        // 4. Renderizar Introducción
        const intro = faqData.introduction;
        const $intro = $('.introduction');
        $intro.find('h2').text(intro.title);
        //$intro.find('.introduction-text').text(intro.subtitle);
        
        // Convertir subtitle en divs
        const lines = intro.subtitle.split('\n').filter(line => line.trim() !== '');
        const subtitleHtml = lines.map(line => `<div>${line.trim()}</div>`).join('');
        $intro.find('.introduction-text').html(subtitleHtml);

        const $cta = $intro.find('.cta-button');
        $cta.text(intro.ctaText);
        $cta.attr('href', intro.ctaLink);

        // 5. Renderizar FAQs
        const $faqContainer = $('.faq-section .col-lg-10');
        $faqContainer.empty(); // limpiar contenido anterior
        faqData.faqs.forEach(faq => {
            const faqItem = `
                <details class="faq-item">
                    <summary class="faq-question">${faq.question}</summary>
                    <div class="faq-answer">${faq.answer}</div>
                </details>
            `;
            $faqContainer.append(faqItem);
        });
        $('.faq-section .section-title').text(faqData.title);

        // 6. Renderizar Pricing
        const pricing = faqData.pricing;
        const $pricing = $('.pricing');
        $pricing.find('.section-title').text(pricing.title);
        $pricing.find('.price').text(pricing.price);
        $pricing.find('.price-subtitle').text(pricing.subtitle);
        $pricing.find('.features-list').empty();
        pricing.unique_features.forEach(f => {
            $pricing.find('.features-list').append(`<li>${f}</li>`);
        });
        $pricing.find('.cta-button').text(pricing.ctaText).attr('href', pricing.ctaLink);

        // 7. Renderizar Findings
        const findings = faqData.findings;
        const $findings = $('.content');
        $findings.empty();
        $findings.append(`<h2 class="findings-title">${findings.title}</h2>`);
        findings.key_findings.forEach(text => {
            $findings.append(`
                <div class="finding">
                    <div class="finding-text">${text}</div>
                </div>
            `);
        });

        // 8. Renderizar Conclusion
        const conclusion = faqData.conclusion;
        const $conclusion = $('.Conclusion-content');
        $conclusion.find('.Conclusion-title').text(conclusion.title);

        // Suponiendo que conclusion.text es un string con saltos de línea
        const paragraphs = conclusion.text.split('\n').filter(p => p.trim() !== ''); // separar por saltos de línea y eliminar vacíos
        html = paragraphs.map(p => `<div class="Conclusion-text">${p.trim()}</div>`).join('');
        $conclusion.find('.Conclusion-text').html(html);

        //$conclusion.find('.Conclusion-text').html(conclusion.text);
        // 5. Renderizar Errors
        const $errorsContainer = $('.errors-section .col-lg-10');
        $errorsContainer.empty(); // limpiar contenido anterior

        faqData.errors.items.forEach(error => {
            const descHtml = error.description
                .split("\n")
                .filter(line => line.trim() !== "")
                .map(line => `<div>${line.trim()}</div>`)
                .join("");

            const consHtml = error.consequence
                .split("\n")
                .filter(line => line.trim() !== "")
                .map(line => `<div>${line.trim()}</div>`)
                .join("");

            const errorItem = `
                <details class="errors-item">
                    <summary class="errors-description">${descHtml}</summary>
                    <div class="errors-consequence">${consHtml}</div>
                </details>
            `;
            $errorsContainer.append(errorItem);
        });

        // título de la sección
        $('.errors-section .errors-section-title').text(faqData.errors.title);


        // 6. Renderizar Similar
        const $similarContainer = $('.similar-content');

        // título
        $similarContainer.find('.similar-title').text(faqData.similar.title);

        // texto (múltiples párrafos como <div>)
        const similarHtml = faqData.similar.text
            .split("\n")
            .filter(line => line.trim() !== "")
            .map(line => `<div>${line.trim()}</div>`)
            .join("");

        // inyectar en el contenedor
        $similarContainer.find('.similar-text').html(similarHtml);

        // 9. Devolver HTML final en JSON
        res.json({ html: $.html() });
    });
});