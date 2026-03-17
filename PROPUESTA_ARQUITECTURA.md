# Propuesta de Arquitectura de Contenido

## Análisis del Estado Actual

### Categorías actuales:
- **analisis-transaccional** (9 páginas)
- **formacion** (5 páginas)
- **psicoterapia** (6 páginas)
- **certificacion** (8 páginas)
- **blog** (1 página)
- **gabinete** (1 página)
- **general** (64 páginas - muchas son archivos/images PDFs)

### Problemas identificados:
1. Demasiadas secciones principales (7)
2. "general" tiene demasiado contenido variado (archivos, imágenes, páginas sueltas)
3. Navegación confusa
4. Algo de contenido duplicado o irrelevante (capturas de pantalla, logos)

---

## Propuesta de Nueva Arquitectura

### 📌 Secciones propuestas: 6

| # | Sección | Descripción |
|---|---------|-------------|
| 1 | **Inicio** | Landing page con información general |
| 2 | **Análisis Transaccional** | Qué es AT, conceptos, filosofía |
| 3 | **Psicoterapia** | Servicios terapéuticos |
| 4 | **Formación** | Cursos y certificación |
| 5 | **Blog** | Artículos y recursos |
| 6 | **Contacto** | Info de contacto + legal |

---

## Navegación Propuesta

```
├── Inicio
├── Análisis Transaccional
│   ├── Qué es AT
│   ├── Conceptos
│   ├── Terapia de Redirección
│   ├── Bibliografía
│   └── Organizaciones
├── Psicoterapia
│   ├── Proceso terapéutico
│   ├── Reglas de terapia
│   ├── Área de clientes
│   └── Grupos
├── Formación
│   ├── Curso 101
│   ├── Curso Fundamentos
│   ├── Seminarios (SARAT/SIPAT)
│   └── Certificación
├── Blog
│   └── Artículos
└── Contacto
    ├── Información
    ├── Aviso legal
    └── Política de privacidad
```

---

## Contenido por Sección

### 1. Inicio
- Landing page actual

### 2. Análisis Transaccional
Mover desde `analisis-transaccional`:
- que-es-el-at.md
- presentacion-at.md
- conceptos-at.md
- bibliografia-basica.md
- organizaciones-at.md
- la-terapia-de-redecision.md
- el-proceso-de-redecision.md
- articulos.md (o mover a Blog)
- obras-de-eric-berne.md

### 3. Psicoterapia
Mover desde `psicoterapia`:
- psicoterapia.md
- el-proceso-terapeutico.md
- reglas-de-la-terapia.md
- area-de-clientes.md
- preparar-el-trabajo-terapeutico.md
- grupo-de-psicoterapia-y-crecimiento-personal.md

### 4. Formación
Mover desde `formacion`:
- entrenamiento-de-profesionales.md
- el-curso-101-de-at.md
- curso-de-fundamentos-de-at-integrativo.md
- seminario-de-supervision-y-formacion.md
- contenidos-del-programa.md

Y desde `certificacion`:
- certificacon-como-analista-transaccional.md
- conocer-aprender-entrenarse-y-certificarse-en-analisis-transaccional.md
- descripcion-de-los-requisitos-para-certificarse-en-at.md
- duracion-y-curriculum-del-entrenamiento-en-at.md
- examenes-y-requisitos-para-el-examen-de-cta.md
- la-relacion-entrenador-entrenado.md
- los-cuatro-campos-de-aplicacion-del-at.md
- proceso-de-certificacion.md

### 5. Blog
- blog.md
- la-parabola-del-jardin.md

### 6. Contacto
Mover desde `general`:
- contactar.md → info de contacto
- aviso-legal.md
- politica-de-privacidad.md
- politica-de-cookies.md

Mover desde `gabinete`:
- jesus-cuadra-perez.md → página "Sobre mí" o en Inicio

---

## Contenido aArchivar/Eliminar

El contenido en `general` que son solo imágenes, logos o archivos (no contenido útil):
- Archivos PNG/JPG de cursos
- Capturas de pantalla antiguas
- PDFs sueltos sin contexto
- Logs de cursos antiguos

Estos pueden staying en una sección "Recursos" o archivarse.

---

## Próximos Pasos

1. Aprobar esta arquitectura
2. Reorganizar carpetas de contenido
3. Actualizar navegación en Astro
4. Rediseñar estilos (FASE 2)

---

*Propuesta generada el 17/03/2026*
