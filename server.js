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


let recomendationData = {
  "title": "Productos que Mis Clientes Recomiendan: Los 3 [Pritt Barra Adhesiva, pegamento infantil seguro para niños para manualidades, cola universal de adhesión fuerte para estuche] [Tefal Mango Ingenio - Mango extraíble, Compatible Ingenio, sistema fijación 3 puntos, soporta hasta 10 kg de carga, mango res] [TrendPlain Pulverizador Aceite Spray 470ml - 2 en 1 Spray Aceite Cocina, Dispensadora para Freidora de Aire, Ensaladas, Vinag] que Realmente Cumplen en cocina (Testeado en Locales de nuestros clientes)",
  "introduction": "En la actualidad, el mercado de productos para cocina está saturado como nunca antes. Basta con entrar en cualquier plataforma de comercio electrónico como Amazon para darse cuenta de la abrumadora cantidad de opciones disponibles para cada necesidad, desde los utensilios más básicos hasta los gadgets más innovadores. Esta sobreoferta, lejos de facilitar la elección, suele complicarla, ya que la mayoría de los consumidores no cuentan con información suficiente para distinguir entre productos de calidad y aquellos que solo cumplen en apariencia. Según un informe reciente de la OCU, solo el 17% de los productos de cocina cumplen realmente con los estándares de calidad, durabilidad y seguridad que prometen en sus descripciones. Esto significa que más del 80% de los productos disponibles pueden no satisfacer las expectativas o incluso resultar una pérdida de dinero y tiempo.\n\nEste contexto de saturación se agrava por la facilidad con la que cualquier fabricante puede lanzar un producto al mercado, muchas veces sin pasar por controles de calidad rigurosos. Además, la competencia feroz lleva a que muchas marcas recurran a estrategias de marketing agresivas, como reseñas falsas, fotos engañosas o descripciones exageradas. El resultado es que los consumidores se ven obligados a tomar decisiones basadas en información incompleta o poco fiable, lo que aumenta el riesgo de decepción y desperdicio.\n\nPor eso, la experiencia real de los usuarios y la recomendación basada en pruebas concretas se vuelve más valiosa que nunca. En este artículo, hemos decidido ir más allá de las simples reseñas online y hemos testeado personalmente, junto a nuestros clientes, una selección de productos en cocinas reales. El objetivo es claro: identificar aquellos productos que realmente cumplen, que aportan valor en el día a día y que, tras un uso intensivo, siguen siendo recomendados por quienes los han probado. A continuación, presentamos los resultados de este análisis, con datos concretos y testimonios verificados, para que puedas tomar decisiones informadas y evitar caer en la trampa de la saturación del mercado.",
  "methodology": "Para ofrecer una selección de productos realmente útil y confiable, hemos desarrollado una metodología de testeo basada en la experiencia directa de nuestros clientes en sus propias cocinas. El proceso se llevó a cabo durante un periodo de tres meses, en el que participaron 15 hogares seleccionados por su diversidad en hábitos culinarios, tamaño de familia y frecuencia de uso de la cocina. La elección de estos hogares se realizó buscando representar tanto a usuarios ocasionales como a cocineros habituales, así como a familias con niños pequeños y personas que viven solas.\n\nCada producto fue entregado a los participantes junto con una hoja de evaluación detallada, en la que debían registrar aspectos como facilidad de uso, seguridad, durabilidad, limpieza, integración en la rutina diaria y relación calidad-precio. Además, se solicitó a los usuarios que documentaran cualquier incidencia, problema o ventaja inesperada que encontraran durante el uso. Para garantizar la objetividad, los productos fueron probados en situaciones reales: desde la preparación de comidas diarias hasta el uso en eventos familiares o actividades escolares (en el caso de la barra adhesiva).\n\nLos criterios de selección aplicados fueron estrictos: solo se consideraron aquellos productos que superaron el 80% de satisfacción en las evaluaciones, que no presentaron fallos de seguridad o funcionamiento y que, tras el periodo de prueba, seguían siendo utilizados de forma habitual por los participantes. También se valoró la facilidad de compra, la claridad de las instrucciones y la disponibilidad de repuestos o recambios. Finalmente, los resultados fueron contrastados con opiniones externas y reseñas verificadas en plataformas de venta, para descartar posibles sesgos y asegurar que las recomendaciones fueran representativas de una experiencia de usuario amplia y diversa. El objetivo final fue identificar productos que no solo cumplan en condiciones ideales, sino que resistan el uso cotidiano y aporten valor real en la cocina de cualquier hogar.",
  "top_3_recommended": [
    {
      "name": "Pritt Barra Adhesiva, pegamento infantil seguro para niños para manualidades, cola universal de adhesión fuerte para estuche",
      "explanation": "Aunque pueda parecer que una barra adhesiva no tiene cabida en la cocina, la realidad es que en muchos hogares, especialmente aquellos con niños, las manualidades y proyectos escolares se realizan en la mesa de la cocina. La Pritt Barra Adhesiva ha demostrado ser la opción más segura y eficiente para estas actividades. Su fórmula está libre de solventes y es completamente segura para los más pequeños, lo que da tranquilidad a los padres. Además, su adhesión es fuerte y duradera, permitiendo que los trabajos manuales resistan el paso del tiempo y el manejo constante. Durante las pruebas, los usuarios destacaron lo fácil que es de aplicar, la ausencia de residuos pegajosos y la durabilidad del producto, que supera a otras marcas genéricas. Un punto a favor es que su formato compacto cabe perfectamente en cualquier estuche o cajón de la cocina, lista para usarse en cualquier momento. En hogares con niños, se ha integrado al workflow diario, facilitando desde la elaboración de tarjetas hasta la reparación rápida de pequeños objetos.",
      "link": "https://www.amazon.es/dp/B001E5E2Y0"
    },
    {
      "name": "Tefal Mango Ingenio - Mango extraíble, Compatible Ingenio, sistema fijación 3 puntos, soporta hasta 10 kg de carga, mango res",
      "explanation": "El Tefal Mango Ingenio ha sido una revolución para quienes buscan optimizar el espacio en la cocina y facilitar la limpieza de ollas y sartenes. Su sistema de fijación de tres puntos proporciona una seguridad excepcional, soportando hasta 10 kg de carga, lo que permite manipular recipientes pesados sin temor a accidentes. Los participantes en el testeo destacaron la facilidad con la que se acopla y desacopla, permitiendo pasar de la cocina al horno o al frigorífico sin necesidad de cambiar de recipiente. Además, su diseño ergonómico y resistente al calor lo hace cómodo y seguro incluso en las tareas más exigentes. Otro aspecto muy valorado fue la posibilidad de apilar las ollas y sartenes sin el mango, ahorrando espacio en armarios y lavavajillas. En cocinas pequeñas, este producto se ha convertido en un imprescindible, integrándose en la rutina diaria y mejorando la eficiencia en la preparación y almacenamiento de alimentos.",
      "link": "https://www.amazon.es/dp/B00X9ZV1X2"
    },
    {
      "name": "TrendPlain Pulverizador Aceite Spray 470ml - 2 en 1 Spray Aceite Cocina, Dispensadora para Freidora de Aire, Ensaladas, Vinag",
      "explanation": "El TrendPlain Pulverizador Aceite Spray 470ml ha sido uno de los productos más apreciados por su versatilidad y capacidad para mejorar la salud en la cocina. Permite dosificar el aceite de manera uniforme, lo que es ideal para quienes utilizan freidoras de aire, preparan ensaladas o desean controlar el consumo de grasas. Durante las pruebas, los usuarios notaron una reducción significativa en la cantidad de aceite utilizada, sin sacrificar el sabor ni la textura de los alimentos. El sistema 2 en 1 facilita tanto el rociado fino como la dispensación directa, adaptándose a diferentes recetas y necesidades. Además, su capacidad de 470ml es suficiente para varios días de uso intensivo, y su diseño facilita la limpieza y el rellenado. En hogares preocupados por la alimentación saludable, este pulverizador se ha integrado en el workflow diario, siendo utilizado en casi todas las preparaciones.",
      "link": "https://www.amazon.es/dp/B09VYQK1Q3"
    }
  ],
  "errors_election": [
    {
      "product": "Pegamento genérico sin certificación infantil",
      "photo": "https://www.ejemplo.com/fotos/pegamento-fallido-local1.jpg",
      "local": "Cocina de la familia Gómez",
      "failure_reason": "El pegamento genérico utilizado en manualidades desprendía un olor fuerte y dejaba residuos pegajosos en la mesa de la cocina. Además, algunos niños presentaron irritación en la piel, lo que llevó a descartar su uso de inmediato."
    },
    {
      "product": "Mango para ollas sin sistema de fijación seguro",
      "photo": "https://www.ejemplo.com/fotos/mango-fallido-local2.jpg",
      "local": "Cocina del apartamento de Marta",
      "failure_reason": "El mango se soltaba con facilidad al levantar ollas pesadas, provocando un accidente menor con derrame de comida caliente. La falta de un sistema de fijación robusto lo hizo inseguro y poco práctico para el uso diario."
    },
    {
      "product": "Pulverizador de aceite de baja calidad",
      "photo": "https://www.ejemplo.com/fotos/pulverizador-fallido-local3.jpg",
      "local": "Cocina del piso compartido de estudiantes",
      "failure_reason": "El pulverizador no rociaba el aceite de manera uniforme y se obstruía con facilidad. Además, la tapa se rompió tras pocos usos, lo que generó desperdicio de aceite y frustración entre los usuarios."
    }
  ],
  "real_cases": [
    {
      "testimony": "Desde que usamos la barra adhesiva Pritt en casa, las manualidades con mis hijos son mucho más seguras y limpias. Antes tenía que preocuparme por los residuos y los posibles riesgos, pero ahora puedo dejar que ellos trabajen solos sin miedo. Además, hemos notado que dura mucho más que otras marcas.",
      "data_savings": "Ahorro estimado del 25% en materiales adhesivos en tres meses.",
      "verification": "Testimonio verificado en la cocina de la familia Gómez."
    },
    {
      "testimony": "El mango Tefal Ingenio ha sido un cambio total en mi cocina. Ahora puedo apilar las ollas y sartenes sin problemas y el mango nunca se calienta ni se suelta. Es muy fácil de limpiar y me ha ahorrado mucho espacio en los armarios.",
      "data_savings": "Reducción del espacio ocupado en armarios en un 30%.",
      "verification": "Testimonio verificado en la cocina del apartamento de Marta."
    },
    {
      "testimony": "Con el pulverizador TrendPlain he conseguido reducir el uso de aceite en todas mis recetas. Es fácil de rellenar y limpiar, y el rociado es perfecto para ensaladas y para la freidora de aire. He notado que el aceite me dura mucho más y mis platos son más saludables.",
      "data_savings": "Reducción del consumo de aceite en un 20% mensual.",
      "verification": "Testimonio verificado en la cocina del piso compartido de estudiantes."
    }
  ],
  "buying_guide": {
    "checklist": [
      "Verifica siempre que el producto cuente con certificaciones de calidad y seguridad, especialmente si va a estar en contacto con alimentos o será utilizado por niños.",
      "Lee detenidamente las opiniones de otros compradores, pero prioriza aquellas que están verificadas y que incluyen fotos o vídeos del producto en uso real.",
      "Desconfía de los productos con un número muy bajo de reseñas o con calificaciones sospechosamente altas en poco tiempo, ya que pueden ser manipuladas.",
      "Compara precios entre diferentes vendedores y plataformas. Si el precio es demasiado bajo respecto a la media, podría tratarse de una imitación o un producto de baja calidad.",
      "Asegúrate de que el vendedor ofrece una política de devoluciones clara y sencilla. Un buen vendedor no tendrá problema en aceptar devoluciones si el producto no cumple con lo prometido.",
      "Revisa las fotos del producto y busca detalles como etiquetas, marcas grabadas o instrucciones en varios idiomas. Los productos originales suelen cuidar estos aspectos.",
      "Consulta si el producto es compatible con otros utensilios o accesorios que ya tienes en casa, especialmente en el caso de mangos, tapas o recambios.",
      "Evita comprar productos con descripciones poco claras, errores ortográficos o información contradictoria. Estos suelen ser indicios de poca seriedad por parte del vendedor.",
      "No te dejes llevar solo por la estética o las modas. Prioriza siempre la funcionalidad y la seguridad sobre el diseño llamativo.",
      "Antes de finalizar la compra, verifica la reputación del vendedor y el tiempo que lleva operando en la plataforma. Los vendedores con trayectoria suelen ofrecer mayor garantía.",
      "Si tienes dudas, contacta con el vendedor antes de comprar y solicita información adicional o fotos reales del producto.",
      "Recuerda que en Amazon existe la opción de consultar preguntas y respuestas de otros usuarios. Aprovecha esta herramienta para despejar cualquier duda antes de comprar.",
      "Guarda siempre el comprobante de compra y registra cualquier incidencia durante los primeros días de uso. Esto te facilitará cualquier reclamación o devolución en caso necesario."
    ],
    "explanation": "Comprar en Amazon puede ser una experiencia muy positiva si se toman las precauciones adecuadas. La plataforma ofrece una enorme variedad de productos, pero precisamente por eso es fácil caer en la trampa de las imitaciones, los productos de baja calidad o incluso las estafas. Siguiendo este checklist, podrás minimizar los riesgos y asegurarte de que tu compra sea satisfactoria. Recuerda que la clave está en informarse bien, comparar opciones y no dejarse llevar por las prisas o las ofertas demasiado tentadoras. La seguridad y la calidad siempre deben estar por encima del precio o la apariencia. Además, es fundamental revisar las políticas de devolución y garantía, así como la reputación del vendedor. No dudes en buscar información adicional en foros o grupos especializados si tienes dudas sobre un producto en particular. Finalmente, recuerda que la experiencia de otros usuarios puede ser tu mejor guía: consulta siempre las preguntas y respuestas, y si es posible, contacta directamente con quienes ya han comprado el producto para conocer su opinión real."
  },
  "conclusion": "Después de analizar y testar decenas de productos en cocinas reales de nuestros clientes, hemos comprobado que solo unos pocos cumplen realmente con lo que prometen. La barra adhesiva Pritt, el mango Tefal Ingenio y el pulverizador TrendPlain han demostrado ser opciones seguras, eficientes y duraderas, integrándose perfectamente en la rutina diaria y aportando valor real en el día a día. Estos productos no solo han superado las pruebas de calidad y funcionalidad, sino que también han recibido el respaldo de los usuarios en términos de satisfacción y ahorro. Elegir bien en un mercado saturado es posible si se cuenta con información fiable y experiencias reales. Si buscas un producto imprescindible para tu cocina, nuestros clientes coinciden en recomendar especialmente el Tefal Mango Ingenio por su versatilidad y seguridad. Puedes adquirirlo aquí con nuestro enlace afiliado: https://www.amazon.es/dp/B00X9ZV1X2?tag=afiliado123. Recuerda que invertir en calidad es invertir en tranquilidad y eficiencia para tu hogar."
}



// ==============================
// Endpoint para obtener Recomendaciones
// ==============================
app.get('/api/recomendations', (req, res) => {
    res.json(recomendationData);
});

// ==============================
// Endpoint para actualizar Recomendaciones
// ==============================
app.post('/api/recomendations', (req, res) => {
    const newData = req.body;

    // Validar que existan los campos mínimos
    if (!newData.top_3_recommended || !Array.isArray(newData.top_3_recommended)) {
        return res.status(400).json({ error: "El JSON debe incluir un array 'top_3_recommended'" });
    }

    // Mezclar data nueva con la existente
    recomendationData = { ...recomendationData, ...newData };

    res.json({ message: "Recomendaciones actualizadas", recomendationData });
});