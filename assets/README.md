# Iconos necesarios para Pokemon Bank

Coloca los siguientes archivos de iconos en esta carpeta para una experiencia completa:

## Archivos requeridos:

### icon.ico (256x256, formato ICO)

- Icono principal para Windows
- Se usa en el ejecutable y el instalador

### icon.png (512x512, formato PNG)

- Icono para la aplicación Electron
- Se usa en la ventana de la aplicación

## Herramientas recomendadas para crear iconos:

- **Online**: [favicon.io](https://favicon.io/), [convertio.co](https://convertio.co/)
- **Software**: GIMP, Photoshop, Inkscape
- **Comandos**: ImageMagick (`convert icon.png icon.ico`)

## Generación automática:

Si solo tienes un PNG de alta resolución, puedes usar ImageMagick:

```bash
# Instalar ImageMagick primero
# Desde PNG a ICO (Windows)
magick convert icon.png -resize 256x256 icon.ico

# Desde PNG a ICNS (macOS)
magick convert icon.png -resize 512x512 icon.icns
```

## Ejemplo con PowerShell (si tienes ImageMagick):

```powershell
# Convertir PNG a ICO
magick convert icon.png -define icon:auto-resize=256,128,64,48,32,16 icon.ico
```

Por ahora, la aplicación funcionará sin iconos personalizados usando los iconos por defecto de Electron.
