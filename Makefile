PYTHON ?= python3
ROOT := /workspace

.PHONY: analyze fix

analyze:
	$(PYTHON) $(ROOT)/tools/prompt_evolver.py --path $(ROOT) --report $(ROOT)/prompt_evolution_report_baseline.md | cat

fix:
	$(PYTHON) $(ROOT)/tools/prompt_evolver.py --path $(ROOT) --report $(ROOT)/prompt_evolution_report.md --apply-minimal-fixes | cat

