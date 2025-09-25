#!/usr/bin/env node

/**
 * AUTO-UPDATER: Sistema de Actualizaciones Automáticas
 *
 * Gestiona actualizaciones automáticas del ecosistema:
 * - Verificación periódica de actualizaciones
 * - Descarga e instalación automática
 * - Rollback automático en caso de fallos
 * - Notificaciones de actualizaciones disponibles
 * - Gestión de versiones y changelog
 */

const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const EventEmitter = require('events');

class AutoUpdater extends EventEmitter {
    constructor(config = {}) {
        super();
        this.config = {
            checkInterval: config.checkInterval || 3600000, // 1 hora
            autoInstall: config.autoInstall !== false,
            backupBeforeUpdate: config.backupBeforeUpdate !== false,
            notifyOnUpdate: config.notifyOnUpdate !== false,
            maxRetries: config.maxRetries || 3,
            repositories: config.repositories || [
                {
                    name: 'main',
                    type: 'git',
                    url: 'origin',
                    branch: 'main',
                    enabled: true
                }
            ],
            ...config
        };

        this.currentVersion = this.getCurrentVersion();
        this.latestVersion = null;
        this.updateInProgress = false;
        this.updateHistory = [];
        this.rollbackVersions = [];

        this.init();
    }

    async init() {
        console.log('⬆️  Inicializando Auto-Updater...');

        try {
            // Cargar historial de actualizaciones
            await this.loadUpdateHistory();

            // Verificar actualizaciones disponibles
            await this.checkForUpdates();

            // Configurar verificación periódica
            this.scheduleUpdateChecks();

            console.log('✅ Auto-Updater inicializado');
        } catch (error) {
            console.error('❌ Error inicializando Auto-Updater:', error);
        }
    }

    getCurrentVersion() {
        try {
            const packageJson = require('./package.json');
            return packageJson.version || '1.0.0';
        } catch (error) {
            return '1.0.0';
        }
    }

    async loadUpdateHistory() {
        try {
            const historyPath = path.join(__dirname, 'auto-updates', 'update-history.json');
            const historyData = await fs.readFile(historyPath, 'utf8');
            this.updateHistory = JSON.parse(historyData);
        } catch (error) {
            this.updateHistory = [];
        }
    }

    async saveUpdateHistory() {
        const historyPath = path.join(__dirname, 'auto-updates', 'update-history.json');
        await fs.mkdir(path.dirname(historyPath), { recursive: true });
        await fs.writeFile(historyPath, JSON.stringify(this.updateHistory, null, 2));
    }

    scheduleUpdateChecks() {
        setInterval(async () => {
            await this.checkForUpdates();
        }, this.config.checkInterval);

        console.log(`⏰ Verificación de actualizaciones cada ${this.config.checkInterval / 60000} minutos`);
    }

    async checkForUpdates() {
        if (this.updateInProgress) {
            console.log('⏳ Actualización en progreso, omitiendo verificación');
            return;
        }

        console.log('🔍 Verificando actualizaciones...');

        try {
            for (const repo of this.config.repositories) {
                if (repo.enabled) {
                    await this.checkRepositoryUpdates(repo);
                }
            }
        } catch (error) {
            console.error('❌ Error verificando actualizaciones:', error);
        }
    }

    async checkRepositoryUpdates(repo) {
        console.log(`🔍 Verificando ${repo.name} (${repo.type})...`);

        try {
            switch (repo.type) {
                case 'git':
                    await this.checkGitUpdates(repo);
                    break;
                case 'npm':
                    await this.checkNpmUpdates(repo);
                    break;
                case 'http':
                    await this.checkHttpUpdates(repo);
                    break;
                default:
                    console.log(`⚠️  Tipo de repositorio no soportado: ${repo.type}`);
            }
        } catch (error) {
            console.error(`❌ Error verificando ${repo.name}:`, error);
        }
    }

    async checkGitUpdates(repo) {
        try {
            // Obtener información del repositorio remoto
            await execPromise('git fetch ' + repo.url);

            // Comparar versiones
            const { stdout: localCommit } = await execPromise('git rev-parse HEAD');
            const { stdout: remoteCommit } = await execPromise('git rev-parse ' + repo.url + '/' + repo.branch);

            if (localCommit.trim() !== remoteCommit.trim()) {
                console.log('⬆️  Actualización disponible en Git');
                this.latestVersion = await this.getRemoteVersion(repo);
                await this.handleUpdateAvailable(repo, {
                    type: 'git',
                    from: localCommit.substring(0, 7),
                    to: remoteCommit.substring(0, 7),
                    changelog: await this.getGitChangelog(localCommit.trim(), remoteCommit.trim())
                });
            } else {
                console.log('✅ Git está actualizado');
            }
        } catch (error) {
            console.error('❌ Error verificando actualizaciones Git:', error);
        }
    }

    async checkNpmUpdates(repo) {
        try {
            const packageJson = require('./package.json');
            const packageName = packageJson.name;

            const { stdout } = await execPromise('npm view ' + packageName + ' version');
            const latestVersion = stdout.trim();

            if (latestVersion !== this.currentVersion) {
                console.log('⬆️  Actualización disponible en npm');
                this.latestVersion = latestVersion;
                await this.handleUpdateAvailable(repo, {
                    type: 'npm',
                    from: this.currentVersion,
                    to: latestVersion,
                    changelog: await this.getNpmChangelog(packageName, this.currentVersion, latestVersion)
                });
            } else {
                console.log('✅ npm está actualizado');
            }
        } catch (error) {
            console.error('❌ Error verificando actualizaciones npm:', error);
        }
    }

    async checkHttpUpdates(repo) {
        try {
            const response = await fetch(repo.url + '/version.json');
            const versionData = await response.json();

            if (versionData.version !== this.currentVersion) {
                console.log('⬆️  Actualización disponible en HTTP');
                this.latestVersion = versionData.version;
                await this.handleUpdateAvailable(repo, {
                    type: 'http',
                    from: this.currentVersion,
                    to: versionData.version,
                    changelog: versionData.changelog
                });
            } else {
                console.log('✅ HTTP está actualizado');
            }
        } catch (error) {
            console.error('❌ Error verificando actualizaciones HTTP:', error);
        }
    }

    async handleUpdateAvailable(repo, updateInfo) {
        console.log(`📦 Actualización disponible: ${updateInfo.from} → ${updateInfo.to}`);

        this.emit('update-available', {
            repository: repo.name,
            version: updateInfo.to,
            type: updateInfo.type,
            changelog: updateInfo.changelog,
            timestamp: new Date().toISOString()
        });

        if (this.config.autoInstall) {
            await this.installUpdate(repo, updateInfo);
        } else {
            console.log('💡 Actualización disponible. Usa el dashboard o ejecuta manualmente.');
        }
    }

    async installUpdate(repo, updateInfo) {
        if (this.updateInProgress) {
            console.log('⏳ Ya hay una actualización en progreso');
            return;
        }

        this.updateInProgress = true;
        console.log('⬆️  Iniciando instalación de actualización...');

        const updateAttempt = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            fromVersion: this.currentVersion,
            toVersion: updateInfo.to,
            repository: repo.name,
            status: 'in_progress',
            retries: 0
        };

        try {
            // Backup antes de actualizar
            if (this.config.backupBeforeUpdate) {
                await this.createPreUpdateBackup(updateAttempt.id);
            }

            // Instalar actualización según tipo
            switch (updateInfo.type) {
                case 'git':
                    await this.installGitUpdate(repo, updateInfo, updateAttempt);
                    break;
                case 'npm':
                    await this.installNpmUpdate(repo, updateInfo, updateAttempt);
                    break;
                case 'http':
                    await this.installHttpUpdate(repo, updateInfo, updateAttempt);
                    break;
            }

            // Verificar instalación
            await this.verifyUpdate(updateAttempt);

            // Actualizar historial
            updateAttempt.status = 'completed';
            updateAttempt.completedAt = new Date().toISOString();
            this.updateHistory.push(updateAttempt);
            await this.saveUpdateHistory();

            // Actualizar versión actual
            this.currentVersion = updateInfo.to;

            console.log('✅ Actualización instalada exitosamente');
            this.emit('update-installed', updateAttempt);

            // Limpiar backups antiguos
            await this.cleanupOldBackups();

        } catch (error) {
            console.error('❌ Error instalando actualización:', error);
            updateAttempt.status = 'failed';
            updateAttempt.error = error.message;
            updateAttempt.failedAt = new Date().toISOString();

            this.updateHistory.push(updateAttempt);
            await this.saveUpdateHistory();

            // Intentar rollback si es posible
            await this.attemptRollback(updateAttempt, error);

            this.emit('update-failed', { attempt: updateAttempt, error: error.message });
        } finally {
            this.updateInProgress = false;
        }
    }

    async installGitUpdate(repo, updateInfo, updateAttempt) {
        console.log('⬆️  Instalando actualización Git...');

        // Crear rama de backup
        const backupBranch = \`backup-before-\${updateAttempt.id}\`;
        await execPromise(\`git checkout -b \${backupBranch}\`);

        // Cambiar a rama principal
        await execPromise('git checkout ' + repo.branch);

        // Hacer pull de los cambios
        await execPromise('git pull ' + repo.url + ' ' + repo.branch);

        // Instalar nuevas dependencias
        await execPromise('npm install');

        console.log('✅ Actualización Git completada');
    }

    async installNpmUpdate(repo, updateInfo, updateAttempt) {
        console.log('⬆️  Instalando actualización npm...');

        const packageJson = require('./package.json');
        const packageName = packageJson.name;

        // Actualizar paquete
        await execPromise('npm install ' + packageName + '@' + updateInfo.to);

        console.log('✅ Actualización npm completada');
    }

    async installHttpUpdate(repo, updateInfo, updateAttempt) {
        console.log('⬆️  Instalando actualización HTTP...');

        // Descargar archivos
        const downloadDir = path.join(__dirname, 'auto-updates', 'temp');
        await fs.mkdir(downloadDir, { recursive: true });

        // Este sería implementado según la estructura del repositorio HTTP
        console.log('💡 Actualización HTTP - implementación específica requerida');

        throw new Error('HTTP updates require custom implementation');
    }

    async verifyUpdate(updateAttempt) {
        console.log('🔍 Verificando instalación...');

        try {
            // Verificar que el sistema sigue funcionando
            const { stdout } = await execPromise('curl -s http://localhost:3000/health || echo "not running"');

            if (stdout.includes('not running')) {
                throw new Error('Sistema no responde después de actualización');
            }

            // Verificar versión actualizada
            const currentVersion = this.getCurrentVersion();
            if (currentVersion !== updateAttempt.toVersion) {
                throw new Error(\`Versión no actualizada: \${currentVersion} !== \${updateAttempt.toVersion}\`);
            }

            console.log('✅ Verificación completada');
        } catch (error) {
            throw new Error(\`Verificación fallida: \${error.message}\`);
        }
    }

    async createPreUpdateBackup(updateId) {
        console.log('💾 Creando backup antes de actualizar...');

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(__dirname, 'backup', \`pre-update-\${timestamp}-\${updateId}\`);

        await fs.mkdir(backupDir, { recursive: true });

        // Copiar archivos importantes
        const filesToBackup = [
            'package.json',
            'package-lock.json',
            'config',
            'feedback-data',
            'autopilot-status'
        ];

        for (const file of filesToBackup) {
            try {
                await execPromise(\`cp -r \${file} \${backupDir}/\`);
            } catch (error) {
                // Ignorar si no existe
            }
        }

        console.log(\`✅ Backup creado: \${backupDir}\`);
        return backupDir;
    }

    async attemptRollback(updateAttempt, error) {
        console.log('⏪ Intentando rollback...');

        try {
            const canRollback = await this.checkRollbackAvailability(updateAttempt);

            if (canRollback) {
                await this.performRollback(updateAttempt);
                console.log('✅ Rollback completado');
                this.emit('rollback-completed', { attempt: updateAttempt, error: error.message });
            } else {
                console.log('⚠️  No se puede realizar rollback automático');
                this.emit('rollback-unavailable', { attempt: updateAttempt, error: error.message });
            }
        } catch (rollbackError) {
            console.error('❌ Error en rollback:', rollbackError);
            this.emit('rollback-failed', { attempt: updateAttempt, error: rollbackError.message });
        }
    }

    async checkRollbackAvailability(updateAttempt) {
        try {
            // Verificar si existe backup
            const backupExists = await this.checkBackupExists(updateAttempt.id);
            if (!backupExists) return false;

            // Verificar que el sistema puede restaurarse
            const { stdout } = await execPromise('git status --porcelain');
            const hasUncommittedChanges = stdout.trim().length > 0;

            return !hasUncommittedChanges;
        } catch (error) {
            return false;
        }
    }

    async checkBackupExists(updateId) {
        const backupDir = path.join(__dirname, 'backup');
        try {
            const files = await fs.readdir(backupDir);
            return files.some(file => file.includes(updateId));
        } catch (error) {
            return false;
        }
    }

    async performRollback(updateAttempt) {
        console.log('⏪ Realizando rollback...');

        // Restaurar desde backup
        const backupDir = await this.findBackup(updateAttempt.id);
        if (backupDir) {
            await execPromise(\`cp -r \${backupDir}/* ./\`);

            // Restaurar Git si es necesario
            const gitBackupExists = await this.checkGitBackup(updateAttempt);
            if (gitBackupExists) {
                await execPromise('git reset --hard HEAD~1');
                await execPromise('git clean -fd');
            }

            console.log('✅ Rollback completado');
        }
    }

    async findBackup(updateId) {
        const backupDir = path.join(__dirname, 'backup');
        const files = await fs.readdir(backupDir);
        const backupFile = files.find(file => file.includes(updateId));
        return backupFile ? path.join(backupDir, backupFile) : null;
    }

    async checkGitBackup(updateAttempt) {
        try {
            const { stdout } = await execPromise('git log --oneline -1');
            return stdout.includes(updateAttempt.id) || stdout.includes('update');
        } catch (error) {
            return false;
        }
    }

    async cleanupOldBackups() {
        console.log('🧹 Limpiando backups antiguos...');

        try {
            const backupDir = path.join(__dirname, 'backup');
            const files = await fs.readdir(backupDir);
            const now = Date.now();
            const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 días

            for (const file of files) {
                if (file.startsWith('pre-update-')) {
                    const filePath = path.join(backupDir, file);
                    const stats = await fs.stat(filePath);

                    if (now - stats.mtime.getTime() > maxAge) {
                        await execPromise(\`rm -rf "\${filePath}"\`);
                        console.log(\`🗑️  Backup eliminado: \${file}\`);
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error limpiando backups:', error);
        }
    }

    async getRemoteVersion(repo) {
        try {
            switch (repo.type) {
                case 'git':
                    const { stdout } = await execPromise('git ls-remote --tags ' + repo.url + ' | tail -1');
                    return stdout.split('/').pop()?.replace('refs/tags/', '') || 'latest';
                case 'npm':
                    const packageJson = require('./package.json');
                    const { stdout: npmVersion } = await execPromise('npm view ' + packageJson.name + ' version');
                    return npmVersion.trim();
                default:
                    return 'latest';
            }
        } catch (error) {
            return 'latest';
        }
    }

    async getGitChangelog(fromCommit, toCommit) {
        try {
            const { stdout } = await execPromise(\`git log --oneline \${fromCommit}..\${toCommit}\`);
            return stdout.split('\\n').filter(line => line.trim());
        } catch (error) {
            return ['Changelog no disponible'];
        }
    }

    async getNpmChangelog(packageName, fromVersion, toVersion) {
        try {
            const { stdout } = await execPromise(\`npm view \${packageName}@\${toVersion} --json\`);
            const packageInfo = JSON.parse(stdout);
            return packageInfo.changelog || packageInfo.description || 'Changelog no disponible';
        } catch (error) {
            return 'Changelog no disponible';
        }
    }

    async manualUpdateCheck() {
        console.log('🔍 Verificación manual de actualizaciones...');
        await this.checkForUpdates();
    }

    async forceUpdate(repoName = null) {
        console.log('⬆️  Forzando actualización...');

        if (repoName) {
            const repo = this.config.repositories.find(r => r.name === repoName);
            if (repo) {
                await this.checkRepositoryUpdates(repo);
            }
        } else {
            await this.checkForUpdates();
        }
    }

    async getUpdateStatus() {
        return {
            currentVersion: this.currentVersion,
            latestVersion: this.latestVersion,
            updateInProgress: this.updateInProgress,
            lastCheck: this.lastCheckTime,
            updateHistory: this.updateHistory.slice(-10), // Últimas 10 actualizaciones
            repositories: this.config.repositories
        };
    }

    async generateUpdateReport() {
        const report = {
            generated: new Date().toISOString(),
            currentVersion: this.currentVersion,
            latestVersion: this.latestVersion,
            updateHistory: this.updateHistory,
            systemInfo: {
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch,
                uptime: process.uptime()
            }
        };

        const reportPath = path.join(__dirname, 'auto-updates', 'update-report.json');
        await fs.mkdir(path.dirname(reportPath), { recursive: true });
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

        return report;
    }
}

// Función principal
async function main() {
    console.log('🚀 Iniciando Auto-Updater del Ecosistema Code GPT...\n');

    const updater = new AutoUpdater({
        checkInterval: 3600000, // 1 hora
        autoInstall: true,
        backupBeforeUpdate: true,
        notifyOnUpdate: true,
        repositories: [
            {
                name: 'main',
                type: 'git',
                url: 'origin',
                branch: 'main',
                enabled: true
            }
        ]
    });

    // Manejar comandos de línea de comandos
    const args = process.argv.slice(2);

    if (args.length > 0) {
        switch (args[0]) {
            case 'check':
                await updater.manualUpdateCheck();
                break;
            case 'force':
                await updater.forceUpdate(args[1]);
                break;
            case 'status':
                const status = await updater.getUpdateStatus();
                console.log('📊 Estado de actualizaciones:', JSON.stringify(status, null, 2));
                break;
            case 'report':
                const report = await updater.generateUpdateReport();
                console.log('📋 Reporte generado:', report.generated);
                break;
            default:
                console.log('Uso: node auto-updater.js [check|force|status|report]');
        }
        process.exit(0);
    }

    // Manejar señales
    process.on('SIGINT', () => {
        console.log('\n🛑 Deteniendo Auto-Updater...');
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('\n🛑 Deteniendo Auto-Updater...');
        process.exit(0);
    });

    console.log('✅ Auto-Updater iniciado');
    console.log('⏰ Verificación automática cada 1 hora');
    console.log('⬆️  Instalación automática habilitada');
    console.log('💾 Backup antes de actualizar: habilitado');
    console.log('🛑 Presiona Ctrl+C para detener\n');
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = AutoUpdater;