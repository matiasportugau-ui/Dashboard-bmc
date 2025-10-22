# GitHub Copilot Instructions

## Project Overview
This is a multi-agent AI orchestration system (Dashboard-bmc) focused on prompt engineering, automated workflows, and business model canvas generation. The project integrates Python automation scripts with multi-agent prompt orchestration protocols.

## Architecture
- **Multi-Agent System**: Built around RCT-COE (Multi-Agent with Previous Study) protocols
- **Script Automation**: Python scripts in `/scripts/` for calendar integration, prompt evaluation, and workflow automation
- **Prompt Evolution**: Structured prompt development with versioning and evaluation
- **CI/CD Integration**: GitHub Actions workflows for continuous prompt improvement

## n8n Integration Patterns

### Core Integration Strategy
The project is designed to integrate with n8n automation platform for:
- **Workflow Orchestration**: Multi-agent prompt execution chains
- **Calendar Management**: Automated vencimientos (due dates) tracking
- **Prompt Pipeline**: Automated prompt testing and evaluation
- **Report Generation**: Automated business intelligence reports

### Key Integration Points

#### 1. Calendar Automation (`scripts/gcal_sync.py`)
```python
# n8n can trigger calendar synchronization via webhook
# Endpoint: POST /webhook/calendar-sync
# Integrates with Google Calendar API for vencimientos tracking
```

#### 2. Prompt Evaluation Pipeline (`scripts/compare_eval_6.py`)
```python
# n8n workflow can trigger prompt comparisons
# Useful for A/B testing different prompt versions
# Outputs structured evaluation reports
```

#### 3. Multi-Agent Orchestration (`mcp_v1.1.json`)
```json
# Configuration for multi-agent execution
# n8n can orchestrate different AI agents based on this config
# Supports parallel execution and throughput maximization
```

### n8n Workflow Templates

#### Template 1: Automated Prompt Testing
- **Trigger**: Git push to prompts branch
- **Actions**: 
  1. Run prompt evaluation scripts
  2. Generate comparison reports
  3. Update documentation
  4. Notify team via Slack/email

#### Template 2: Calendar Management
- **Trigger**: Schedule (daily/weekly)
- **Actions**:
  1. Sync with Google Calendar
  2. Generate vencimientos reports
  3. Update Excel tracking files
  4. Send notifications for upcoming deadlines

#### Template 3: Multi-Agent Execution
- **Trigger**: Webhook or manual
- **Actions**:
  1. Load agent configuration from `mcp_v1.1.json`
  2. Execute parallel AI agent tasks
  3. Collect and merge results
  4. Generate consolidated reports

## Development Guidelines

### Working with Scripts
- All automation scripts are in `/scripts/` directory
- Use `requirements.txt` for dependencies
- Follow the MCP (Model Context Protocol) v1.1 specification
- Scripts support both dry-run and production modes

### Prompt Development
- Follow the RCT-COE multi-agent protocol structure
- Use versioning format: `v{major}.{minor}.{patch}`
- Include EXPORT_SEAL comments for traceability
- Test prompts using evaluation scripts before deployment

### GitHub Actions Integration
- CI/CD workflows are in `.github/workflows/`
- `main.yml` handles continuous prompt improvement
- Use secrets for API keys (OPENAI_API_KEY, etc.)
- Workflows can trigger n8n via webhook calls

### File Naming Conventions
- Prompts: `{Purpose}_{Version}.md` or `{Purpose}_{Version}_NEUTRO.md`
- Scripts: `{function_name}.py`
- Configs: `{purpose}_v{version}.json`
- Reports: `{type}_{date}_{version}.{ext}`

## Common n8n Integration Patterns

### 1. Webhook-Based Triggers
```javascript
// n8n HTTP Request Node configuration
{
  "method": "POST",
  "url": "{{$json.webhook_url}}",
  "body": {
    "action": "execute_prompt_pipeline",
    "config": "mcp_v1.1.json",
    "prompt_version": "v2.2"
  }
}
```

### 2. File Processing Workflows
- Monitor `/input/` directory for new files
- Process through appropriate scripts
- Output results to `/output/` directory
- Trigger notifications on completion

### 3. Multi-Agent Coordination
- Use the MCP configuration as orchestration blueprint
- Implement parallel agent execution
- Handle agent conflict resolution via User Agents
- Apply 50-cycle optimization with early stopping

## Security & Best Practices
- Store API keys in n8n credentials or environment variables
- Use webhook authentication for external triggers
- Implement proper error handling and logging
- Follow the DSO principle: data-driven analysis over emotional resonance
- Declare "Unknown Zones" when entering novel operational territory

## Monitoring & Observability
- Log all multi-agent executions to `_autoevolve_loop.log`
- Track KPIs: quality≥0.90, stability≥0.92, coverage=100%
- Use early-stop conditions: delta<0.01 for 2 cycles
- Maintain deterministic execution with `seed=1337`
