#!/bin/bash
export SSHPASS='gP7ABTCLCidXGpvt1F?m'
echo "--- Backing up Supabase DB ---"
sshpass -e ssh -o StrictHostKeyChecking=no root@76.13.171.93 "docker exec -t supabase-db pg_dumpall -c -U postgres > /root/backup_full.sql"
echo "--- Zipping project files ---"
sshpass -e ssh -o StrictHostKeyChecking=no root@76.13.171.93 "tar -czvf /root/hlj_dev_migration.tar.gz /root/hlj-dev"
echo "--- Transferring DB backup ---"
sshpass -e scp -o StrictHostKeyChecking=no root@76.13.171.93:/root/backup_full.sql /root/backup_full.sql
echo "--- Transferring project zip ---"
sshpass -e scp -o StrictHostKeyChecking=no root@76.13.171.93:/root/hlj_dev_migration.tar.gz /root/hlj_dev_migration.tar.gz
echo "--- Data transfer complete ---"
