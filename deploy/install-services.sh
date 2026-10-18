#!/usr/bin/env bash
set -euo pipefail
cd /home/bsadmin/tp_site/deploy
install -m 755 build-tp-site-prod-release /home/bsadmin/bin/build-tp-site-prod-release
ln -sfn /home/bsadmin/bin/build-tp-site-prod-release /home/bsadmin/bin/tp-site
ln -sfn /home/bsadmin/bin/build-tp-site-prod-release /usr/local/bin/tp-site
install -m 755 deploy-strapi-production /usr/local/sbin/deploy-strapi-production
install -m 644 tp-site.service strapi.service /etc/systemd/system/
install -m 644 nginx.conf /etc/nginx/sites-available/tp-site
rm -f /etc/nginx/sites-enabled/default
ln -sfn /etc/nginx/sites-available/tp-site /etc/nginx/sites-enabled/tp-site
install -m 644 tp-leads-logrotate /etc/logrotate.d/tp-leads
printf 'bsadmin ALL=(root) NOPASSWD: /usr/bin/systemctl restart tp-site, /usr/bin/systemctl stop tp-site, /usr/local/sbin/deploy-strapi-production\n' > /etc/sudoers.d/tp-site
chmod 440 /etc/sudoers.d/tp-site
visudo -cf /etc/sudoers.d/tp-site
mkdir -p /home/bsadmin/shared/strapi /home/bsadmin/runtime
printf 'NODE_ENV=development\nSTRAPI_MODE=develop\n' > /home/bsadmin/shared/strapi/runtime.env
ln -sfn /home/bsadmin/my-strapi /home/bsadmin/runtime/strapi
chown -R bsadmin:bsadmin /home/bsadmin/shared /home/bsadmin/runtime /home/bsadmin/bin
nginx -t
systemctl daemon-reload
systemctl enable tp-site strapi nginx postgresql
systemctl restart nginx strapi
