import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './App.css';

function App() {
  const [inputText, setInputText] = useState('');
  const [tokens, setTokens] = useState([]);
  const [syntaxErrors, setSyntaxErrors] = useState([]);
  const [semanticErrors, setSemanticErrors] = useState([]);
  const [structureInfo, setStructureInfo] = useState(null);
  const [analysisStatus, setAnalysisStatus] = useState('');
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

      // Actualizar todos los estados con los nuevos datos
      setTokens(data.tokens || []);
      setSyntaxErrors(data.syntaxErrors || []);
      setSemanticErrors(data.semanticErrors || []);
      setStructureInfo(data.structureInfo || null);
      setAnalysisStatus(data.status || 'success');

      // Calcular estadísticas de tokens
      const analysisTokens = data.tokens || [];
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
    setSyntaxErrors([]);
    setSemanticErrors([]);
    setStructureInfo(null);
    setAnalysisStatus('');
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
  title = 'Mi Aplicacion';
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

  // Insertar código con errores sintácticos y semánticos
  const insertErrorExample = () => {
    const errorCode = `// Código con errores sintácticos y semánticos
@Component({
  selector: 'app-error-example'
  template: \`
    <div *ngIf="isVisible">
      <h1>{{ title }}</h1>
      <button (click)="handleClick()">Click</button>
    </div>
  \`
})
export class ErrorComponent implements OnInit {
  title = 'Error Example';
  
  constructor() {
    // Error semántico: variable no declarada
    console.log(undeclaredVariable);
  }
  
  ngOnInit() {
    // Error sintáctico: for mal formado
    fora let i = 0; i < 10; i++ {
      console.log(i);
    }
    
    // Error sintáctico: if sin paréntesis
    if isVisible {
      this.title = 'New Title';
    }
    
    // Error semántico: método no declarado
    this.nonExistentMethod();
  }
  
  // Paréntesis no balanceados
  handleClick( {
    this.isVisible = !this.isVisible;
  // Falta llave de cierre`;
    setInputText(errorCode);
    setFileName('codigo-con-errores-sintacticos.ts');
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
          {(tokens.length > 0 || syntaxErrors.length > 0 || semanticErrors.length > 0) && (
              <div className="results-section">
                <h2>📊 Resultados del Análisis Completo</h2>

                {/* Indicador de estado */}
                <div className={`analysis-status ${analysisStatus}`}>
              <span className="status-icon">
                {analysisStatus === 'success' ? '✅' :
                    analysisStatus === 'syntax_errors' ? '❌' :
                        analysisStatus === 'semantic_errors' ? '⚠️' : '📄'}
              </span>
                  <span className="status-text">
                {analysisStatus === 'success' ? 'Análisis completado sin errores' :
                    analysisStatus === 'syntax_errors' ? 'Se encontraron errores de sintaxis' :
                        analysisStatus === 'semantic_errors' ? 'Se encontraron errores semánticos' :
                            'Análisis en proceso'}
              </span>
                </div>

                {/* Información de estructura */}
                {structureInfo && (
                    <div className="structure-info">
                      <h3>🏗️ Estructura del Código Angular</h3>
                      <div className="structure-grid">
                        <div className="structure-card">
                          <h4>Tipo de Archivo</h4>
                          <div className="structure-badges">
                            {structureInfo.hasComponent && <span className="badge component">Componente</span>}
                            {structureInfo.hasService && <span className="badge service">Servicio</span>}
                            {structureInfo.hasDirective && <span className="badge directive">Directiva</span>}
                            {!structureInfo.hasComponent && !structureInfo.hasService && !structureInfo.hasDirective &&
                                <span className="badge general">Código General</span>}
                          </div>
                        </div>

                        {structureInfo.decorators.length > 0 && (
                            <div className="structure-card">
                              <h4>Decoradores Detectados</h4>
                              <div className="structure-list">
                                {structureInfo.decorators.map((decorator, idx) => (
                                    <span key={idx} className="structure-item decorator">@{decorator}</span>
                                ))}
                              </div>
                            </div>
                        )}

                        {structureInfo.ngDirectives.length > 0 && (
                            <div className="structure-card">
                              <h4>Directivas Angular</h4>
                              <div className="structure-list">
                                {structureInfo.ngDirectives.map((directive, idx) => (
                                    <span key={idx} className="structure-item ng-directive">{directive}</span>
                                ))}
                              </div>
                            </div>
                        )}

                        {structureInfo.variables.length > 0 && (
                            <div className="structure-card">
                              <h4>Variables Declaradas</h4>
                              <div className="structure-list">
                                {structureInfo.variables.map((variable, idx) => (
                                    <span key={idx} className="structure-item variable">{variable}</span>
                                ))}
                              </div>
                            </div>
                        )}

                        {structureInfo.methods.length > 0 && (
                            <div className="structure-card">
                              <h4>Métodos Detectados</h4>
                              <div className="structure-list">
                                {structureInfo.methods.map((method, idx) => (
                                    <span key={idx} className="structure-item method">{method}()</span>
                                ))}
                              </div>
                            </div>
                        )}
                      </div>
                    </div>
                )}

                {/* Errores de sintaxis */}
                {syntaxErrors.length > 0 && (
                    <div className="errors-section syntax-errors">
                      <h3>❌ Errores de Sintaxis ({syntaxErrors.length})</h3>
                      <div className="errors-list">
                        {syntaxErrors.map((error, index) => (
                            <div key={index} className="error-card syntax-error">
                              <div className="error-header">
                                <span className="error-icon">❌</span>
                                <span className="error-location">Línea {error.line}</span>
                                <span className="error-type">{error.errorType}</span>
                              </div>
                              <div className="error-message">{error.message}</div>
                              {error.suggestion && (
                                  <div className="error-suggestion">
                                    <strong>💡 Sugerencia:</strong> {error.suggestion}
                                  </div>
                              )}
                            </div>
                        ))}
                      </div>
                    </div>
                )}

                {/* Errores semánticos */}
                {semanticErrors.length > 0 && (
                    <div className="errors-section semantic-errors">
                      <h3>⚠️ Errores Semánticos ({semanticErrors.length})</h3>
                      <div className="errors-list">
                        {semanticErrors.map((error, index) => (
                            <div key={index} className="error-card semantic-error">
                              <div className="error-header">
                                <span className="error-icon">⚠️</span>
                                <span className="error-location">Línea {error.line}</span>
                                <span className="error-variable">Variable: {error.variable}</span>
                              </div>
                              <div className="error-message">{error.message}</div>
                              <div className="error-context">
                                <strong>Contexto:</strong> <code>{error.context}</code>
                              </div>
                            </div>
                        ))}
                      </div>
                    </div>
                )}

                {/* Estadísticas de tokens */}
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