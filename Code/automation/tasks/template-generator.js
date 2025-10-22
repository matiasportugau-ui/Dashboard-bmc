const fs = require('fs').promises;
const path = require('path');

const templates = {
  'react-component': {
    files: {
      'Component.jsx': `import React from 'react';
import PropTypes from 'prop-types';
import './{{name}}.css';

const {{name}} = ({ children, ...props }) => {
  return (
    <div className="{{kebabCase name}}" {...props}>
      {children}
    </div>
  );
};

{{name}}.propTypes = {
  children: PropTypes.node
};

{{name}}.defaultProps = {
  children: null
};

export default {{name}};`,
      'Component.css': `.{{kebabCase name}} {
  /* Add your styles here */
}`,
      'Component.test.js': `import React from 'react';
import { render, screen } from '@testing-library/react';
import {{name}} from './{{name}}';

describe('{{name}}', () => {
  it('renders children correctly', () => {
    render(<{{name}}>Test Content</{{name}}>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});`,
      'index.js': `export { default } from './{{name}}';`
    }
  },
  
  'node-api': {
    files: {
      'controller.js': `const {{camelCase name}}Service = require('./{{camelCase name}}.service');

class {{name}}Controller {
  async getAll(req, res, next) {
    try {
      const result = await {{camelCase name}}Service.getAll();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const result = await {{camelCase name}}Service.getById(id);
      
      if (!result) {
        return res.status(404).json({ error: '{{name}} not found' });
      }
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const result = await {{camelCase name}}Service.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const result = await {{camelCase name}}Service.update(id, req.body);
      
      if (!result) {
        return res.status(404).json({ error: '{{name}} not found' });
      }
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const result = await {{camelCase name}}Service.delete(id);
      
      if (!result) {
        return res.status(404).json({ error: '{{name}} not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new {{name}}Controller();`,
      'service.js': `class {{name}}Service {
  constructor() {
    // Initialize any dependencies here
    this.data = [];
  }

  async getAll() {
    // Implement your logic here
    return this.data;
  }

  async getById(id) {
    // Implement your logic here
    return this.data.find(item => item.id === id);
  }

  async create(data) {
    // Implement your logic here
    const newItem = {
      id: Date.now().toString(),
      ...data,
      createdAt: new Date()
    };
    this.data.push(newItem);
    return newItem;
  }

  async update(id, data) {
    // Implement your logic here
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    this.data[index] = {
      ...this.data[index],
      ...data,
      updatedAt: new Date()
    };
    return this.data[index];
  }

  async delete(id) {
    // Implement your logic here
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) return false;
    
    this.data.splice(index, 1);
    return true;
  }
}

module.exports = new {{name}}Service();`,
      'routes.js': `const express = require('express');
const router = express.Router();
const {{camelCase name}}Controller = require('./{{camelCase name}}.controller');

router.get('/', {{camelCase name}}Controller.getAll);
router.get('/:id', {{camelCase name}}Controller.getById);
router.post('/', {{camelCase name}}Controller.create);
router.put('/:id', {{camelCase name}}Controller.update);
router.delete('/:id', {{camelCase name}}Controller.delete);

module.exports = router;`
    }
  },
  
  'python-class': {
    files: {
      '__init__.py': `"""{{name}} module."""
from .{{snakeCase name}} import {{name}}

__all__ = ['{{name}}']`,
      'class.py': `"""{{name}} implementation."""
from typing import Any, Dict, List, Optional


class {{name}}:
    """{{name}} class for {{description}}."""
    
    def __init__(self, **kwargs: Any) -> None:
        """Initialize {{name}}.
        
        Args:
            **kwargs: Additional keyword arguments.
        """
        self._data: Dict[str, Any] = kwargs
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get a value by key.
        
        Args:
            key: The key to retrieve.
            default: Default value if key not found.
            
        Returns:
            The value associated with the key.
        """
        return self._data.get(key, default)
    
    def set(self, key: str, value: Any) -> None:
        """Set a value by key.
        
        Args:
            key: The key to set.
            value: The value to associate with the key.
        """
        self._data[key] = value
    
    def __repr__(self) -> str:
        """Return string representation."""
        return f"{{name}}({self._data})"`,
      'test.py': `"""Tests for {{name}}."""
import pytest
from .{{snakeCase name}} import {{name}}


class Test{{name}}:
    """Test cases for {{name}}."""
    
    def test_initialization(self):
        """Test {{name}} initialization."""
        obj = {{name}}(key="value")
        assert obj.get("key") == "value"
    
    def test_get_set(self):
        """Test get and set methods."""
        obj = {{name}}()
        obj.set("test", "value")
        assert obj.get("test") == "value"
    
    def test_get_default(self):
        """Test get with default value."""
        obj = {{name}}()
        assert obj.get("nonexistent", "default") == "default"`
    }
  }
};

async function generateTemplate(data, logger) {
  logger.info(`Generando template: ${data.template}`);
  
  const { template: templateName, name, outputDir, options = {} } = data;
  
  if (!templates[templateName]) {
    throw new Error(`Template no encontrado: ${templateName}`);
  }
  
  const template = templates[templateName];
  const generatedFiles = [];
  
  try {
    // Crear directorio de salida
    const targetDir = path.join(
      outputDir || path.join(__dirname, '../../generated'),
      transformName(name, 'kebabCase')
    );
    await fs.mkdir(targetDir, { recursive: true });
    
    // Generar archivos desde el template
    for (const [fileTemplate, content] of Object.entries(template.files)) {
      const fileName = processTemplate(fileTemplate, { name, ...options });
      const fileContent = processTemplate(content, { name, ...options });
      const filePath = path.join(targetDir, fileName);
      
      await fs.writeFile(filePath, fileContent);
      generatedFiles.push(filePath);
      
      logger.info(`Archivo generado: ${filePath}`);
    }
    
    // Crear metadata del template generado
    const metadata = {
      template: templateName,
      name: name,
      timestamp: new Date().toISOString(),
      files: generatedFiles,
      options: options
    };
    
    await fs.writeFile(
      path.join(targetDir, '.template-metadata.json'),
      JSON.stringify(metadata, null, 2)
    );
    
    logger.info(`Template generado exitosamente en: ${targetDir}`);
    
    return {
      success: true,
      outputDir: targetDir,
      files: generatedFiles,
      metadata
    };
  } catch (error) {
    logger.error(`Error generando template: ${error.message}`);
    throw error;
  }
}

function processTemplate(template, variables) {
  let processed = template;
  
  // Reemplazar variables simples
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    processed = processed.replace(regex, value);
  }
  
  // Procesar transformaciones
  processed = processed.replace(/{{(\w+)\s+(\w+)}}/g, (match, transform, variable) => {
    const value = variables[variable];
    if (!value) return match;
    
    return transformName(value, transform);
  });
  
  return processed;
}

function transformName(name, transform) {
  switch (transform) {
    case 'camelCase':
      return name.charAt(0).toLowerCase() + name.slice(1);
    
    case 'kebabCase':
      return name
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
    
    case 'snakeCase':
      return name
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[\s-]+/g, '_')
        .toLowerCase();
    
    case 'upperCase':
      return name.toUpperCase();
    
    case 'lowerCase':
      return name.toLowerCase();
    
    default:
      return name;
  }
}

// Función para agregar nuevos templates dinámicamente
async function addTemplate(name, templateDefinition) {
  templates[name] = templateDefinition;
  
  // Guardar templates en archivo para persistencia
  const templatesFile = path.join(__dirname, '../../config/templates.json');
  await fs.writeFile(
    templatesFile,
    JSON.stringify(templates, null, 2)
  );
}

module.exports = {
  task: generateTemplate,
  addTemplate,
  getAvailableTemplates: () => Object.keys(templates)
};