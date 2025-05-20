import sys
import os
from pathlib import Path

def read_markdown_file(workflow_name):
    """Read the content of a markdown file."""
    try:
        file_path = Path(__file__).parent / workflow_name
        if file_path.exists():
            with open(file_path, 'r') as file:
                return file.read()
        return f"Workflow file {workflow_name} not found."
    except Exception as e:
        return f"Error reading workflow file: {str(e)}"

def handle_workflow(workflow, repository=None):
    """Handle the workflow processing."""
    valid_workflows = [
        'acceptance-criteria.md',
        'brainstorming.md',
        'bug-report.md',
        'documentation-mgmt.md',
        'planning.md',
        'process-development.md',
        'project-management.md'
    ]

    if workflow not in valid_workflows:
        return f"Unknown workflow: {workflow}"
    
    content = read_markdown_file(workflow)
    return {
        "workflow": workflow,
        "repository": repository,
        "content": content,
        "status": "success"
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print({"error": "No workflow specified."})
        sys.exit(1)

    workflow = sys.argv[1]
    result = handle_workflow(workflow)
    print(result)