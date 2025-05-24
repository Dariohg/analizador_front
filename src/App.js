import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [tokens, setTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [analysisStats, setAnalysisStats] = useState({
    total: 0,
    reservedWords: 0,
    identifiers: 0,
    numbers: 0,
    symbols: 0,
    errors: 0,
    parentheses: 0
  });

  // Manejar drop de archivos
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        setInputText(e.target.result);
      };
      reader.readAsText(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/*': ['.txt', '.ts', '.js', '.html', '.css', '.json']
    },
    multiple: false
  });

  // Analizar el texto
  const analyzeCode = async () => {
    if (!inputText.trim()) {
      alert('Por favor, ingresa código para analizar o carga un archivo');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const data = await response.json();
      const analysisTokens = data.tokens || [];
      setTokens(analysisTokens);

      // Calcular estadísticas
      const stats = {
        total: analysisTokens.length,
        reservedWords: analysisTokens.filter(t => t.type === 'RESERVED_WORD').length,
        identifiers: analysisTokens.filter(t => t.type === 'IDENTIFIER').length,
        numbers: analysisTokens.filter(t => t.type === 'NUMBER').length,
        symbols: analysisTokens.filter(t => t.type === 'SYMBOL').length,
        errors: analysisTokens.filter(t => t.type === 'SYNTAX_ERROR').length,
        parentheses: analysisTokens.filter(t => t.type === 'LEFT_PAREN' || t.type === 'RIGHT_PAREN').length
      };
      setAnalysisStats(stats);

    } catch (error) {
      console.error('Error al analizar:', error);
      alert('Error al conectar con el servidor. Asegúrate de que el backend esté ejecutándose en el puerto 8080.');
    } finally {
      setIsLoading(false);
    }
  };

  // Limpiar todo
  const clearAll = () => {
    setInputText('');
    setTokens([]);
    setFileName('');
    setAnalysisStats({
      total: 0,
      reservedWords: 0,
      identifiers: 0,
      numbers: 0,
      symbols: 0,
      errors: 0,
      parentheses: 0
    });
  };

  // Insertar código de ejemplo
  const insertExampleCode = () => {
    const exampleCode = `@Component({
  selector: 'app-example',
  template: \`
    <div *ngIf="isVisible">
      <h1>{{ title }}</h1>
      <ul>
        <li *ngFor="let item of items">{{ item.name }}</li>
      </ul>
      <button (click)="onClick()">Click me</button>
    </div>
  \`
})
export class ExampleComponent implements OnInit {
  title = 'Mi Aplicación';
  isVisible = true;
  items = [];

  constructor(private service: MyService) {}

  ngOnInit() {
    this.loadData();
  }

  onClick() {
    if (this.isVisible) {
      console.log('Button clicked');
    }
  }

  loadData() {
    this.service.getData().subscribe(data => {
      this.items = data;
    });
  }
}`;
    setInputText(exampleCode);
    setFileName('ejemplo-angular.ts');
  };

  // Insertar código con errores
  const insertErrorExample = () => {
    const errorCode = `// Código con errores de sintaxis
fora (let i = 0; i < 10; i++) {
  iff (component && directive) {
    servicee.getData();
    whilee (true) {
      consolee.log('error');
    }
  }
  elsse {
    modulee.exports = {};
  }
}

// Más errores
componennt myComp = neww Component();
directivve myDir = 123abc;
`;
    setInputText(errorCode);
    setFileName('codigo-con-errores.ts');
  };

  // Traducir tipos de tokens al español
  const translateTokenType = (tokenType) => {
    const translations = {
      'RESERVED_WORD': 'Palabra Reservada',
      'IDENTIFIER': 'Identificador',
      'NUMBER': 'Número',
      'LEFT_PAREN': 'Paréntesis de Apertura',
      'RIGHT_PAREN': 'Paréntesis de Cierre',
      'SYMBOL': 'Símbolo',
      'SYNTAX_ERROR': 'Error de Sintaxis',
      'EOF': 'Fin de Archivo'
    };
    return translations[tokenType] || tokenType;
  };

  // Obtener estilo del token
  const getTokenStyle = (tokenType) => {
    const styles = {
      'RESERVED_WORD': 'token-reserved',
      'IDENTIFIER': 'token-identifier',
      'NUMBER': 'token-number',
      'LEFT_PAREN': 'token-parenthesis',
      'RIGHT_PAREN': 'token-parenthesis',
      'SYMBOL': 'token-symbol',
      'SYNTAX_ERROR': 'token-error',
      'EOF': 'token-eof'
    };
    return styles[tokenType] || 'token-default';
  };

  // Obtener icono del token
  const getTokenIcon = (tokenType) => {
    const icons = {
      'RESERVED_WORD': '🔑',
      'IDENTIFIER': '🏷️',
      'NUMBER': '🔢',
      'LEFT_PAREN': '(',
      'RIGHT_PAREN': ')',
      'SYMBOL': '🔣',
      'SYNTAX_ERROR': '❌',
      'EOF': '🏁'
    };
    return icons[tokenType] || '📄';
  };

  return (
      <div className="App">
        <header className="app-header">
          <h1>🔍 Analizador Léxico Angular</h1>
          <p>Detecta palabras reservadas, identificadores, números y errores de sintaxis</p>
        </header>

        <main className="main-container">
          {/* Sección de entrada */}
          <div className="input-section">
            <div className="file-upload-section">
              <h2>📁 Subir y Analizar</h2>

              {/* Zona de drop */}
              <div
                  {...getRootProps()}
                  className={`dropzone ${isDragActive ? 'dropzone-active' : ''}`}
              >
                <input {...getInputProps()} />
                <div className="dropzone-content">
                  <span className="dropzone-icon">📁</span>
                  {isDragActive ? (
                      <p>Suelta el archivo aquí...</p>
                  ) : (
                      <div>
                        <p><strong>Seleccionar archivo</strong> o arrastrarlo aquí</p>
                        <p className="file-types">Soporta: .txt, .ts, .js, .html, .css, .json</p>
                      </div>
                  )}
                </div>
              </div>

              {fileName && (
                  <div className="file-info">
                    <span className="file-icon">📄</span>
                    <span className="file-name">{fileName}</span>
                  </div>
              )}
            </div>

            <div className="code-input-section">
              <h2>💻 Inserta Código a Analizar</h2>

              <div className="example-buttons">
                <button onClick={insertExampleCode} className="btn btn-example">
                  ✅ Código válido
                </button>
                <button onClick={insertErrorExample} className="btn btn-error">
                  ❌ Código con errores
                </button>
                <button onClick={clearAll} className="btn btn-clear">
                  🗑️ Limpiar todo
                </button>
              </div>

              <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Escribe o pega tu código Angular aquí..."
                  className="code-textarea"
                  rows={12}
              />

              <button
                  onClick={analyzeCode}
                  disabled={isLoading}
                  className="btn btn-analyze"
              >
                {isLoading ? '⏳ Analizando...' : '🚀 Analizar código'}
              </button>
            </div>
          </div>

          {/* Sección de resultados */}
          {tokens.length > 0 && (
              <div className="results-section">
                <h2>📊 Resultados del Análisis</h2>

                {/* Estadísticas */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">📝</div>
                    <div className="stat-info">
                      <span className="stat-value">{analysisStats.total}</span>
                      <span className="stat-label">Total Tokens</span>
                    </div>
                  </div>

                  <div className="stat-card reserved">
                    <div className="stat-icon">🔑</div>
                    <div className="stat-info">
                      <span className="stat-value">{analysisStats.reservedWords}</span>
                      <span className="stat-label">Palabras Reservadas</span>
                    </div>
                  </div>

                  <div className="stat-card identifier">
                    <div className="stat-icon">🏷️</div>
                    <div className="stat-info">
                      <span className="stat-value">{analysisStats.identifiers}</span>
                      <span className="stat-label">Identificadores</span>
                    </div>
                  </div>

                  <div className="stat-card number">
                    <div className="stat-icon">🔢</div>
                    <div className="stat-info">
                      <span className="stat-value">{analysisStats.numbers}</span>
                      <span className="stat-label">Números</span>
                    </div>
                  </div>

                  <div className="stat-card symbol">
                    <div className="stat-icon">🔣</div>
                    <div className="stat-info">
                      <span className="stat-value">{analysisStats.symbols}</span>
                      <span className="stat-label">Símbolos</span>
                    </div>
                  </div>

                  <div className="stat-card parenthesis">
                    <div className="stat-icon">( )</div>
                    <div className="stat-info">
                      <span className="stat-value">{analysisStats.parentheses}</span>
                      <span className="stat-label">Paréntesis</span>
                    </div>
                  </div>

                  <div className="stat-card error">
                    <div className="stat-icon">❌</div>
                    <div className="stat-info">
                      <span className="stat-value">{analysisStats.errors}</span>
                      <span className="stat-label">Errores</span>
                    </div>
                  </div>
                </div>

                {/* Lista de tokens */}
                <div className="tokens-container">
                  <h3>🔍 Tokens Detectados</h3>
                  <div className="tokens-grid">
                    {tokens.map((token, index) => (
                        <div
                            key={index}
                            className={`token-card ${getTokenStyle(token.type)}`}
                        >
                          <div className="token-header">
                            <span className="token-icon">{getTokenIcon(token.type)}</span>
                            <span className="token-type">{translateTokenType(token.type)}</span>
                            <span className="token-position">Línea {token.position}</span>
                          </div>
                          <div className="token-value">"{token.value}"</div>
                          {token.message && (
                              <div className="token-message">{token.message}</div>
                          )}
                        </div>
                    ))}
                  </div>
                </div>

                {/* Tabla resumen */}
                <div className="summary-table">
                  <h3>📋 Resumen Detallado</h3>
                  <table>
                    <thead>
                    <tr>
                      <th>Línea</th>
                      <th>Tipo</th>
                      <th>Símbolo</th>
                      <th>Descripción</th>
                    </tr>
                    </thead>
                    <tbody>
                    {tokens.filter(token => token.type !== 'EOF').map((token, index) => (
                        <tr key={index} className={getTokenStyle(token.type)}>
                          <td>LÍNEA {token.position}</td>
                          <td>
                        <span className="table-token-type">
                          {getTokenIcon(token.type)} {translateTokenType(token.type)}
                        </span>
                          </td>
                          <td className="token-symbol">{token.value}</td>
                          <td>{token.message}</td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </div>
          )}
        </main>

        <footer className="app-footer">
          <p>Analizador Léxico Angular - Go Backend + React Frontend</p>
          <p>Reconoce 70+ palabras reservadas de Angular</p>
        </footer>
      </div>
  );
}

export default App;