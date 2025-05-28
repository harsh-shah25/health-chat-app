# elk_stack Ansible Role

This role applies the ELK stack (Elasticsearch, Kibana, Filebeat) manifests to the Kubernetes cluster.

## Tasks
- Creates the ELK namespace (if not exists)
- Deploys Elasticsearch, Kibana, and Filebeat 