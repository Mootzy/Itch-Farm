yarn build;

aws s3 sync build/ s3://app.itchiro.com/ --profile itchiro;

aws cloudfront create-invalidation --distribution-id E2AUYCL0EQNYFD --paths "/*" --profile itchiro;