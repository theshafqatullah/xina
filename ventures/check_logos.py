import os

companies = ['Vercel','Supabase','Linear','Prisma','Railway','Resend','Neon','Turso','Clerk','Convex','Axiom','Trigger.dev','Inngest','Tinybird','Upstash','Warp','Dub','Cal.com','OpenAI','Anthropic','Replicate','Hugging Face','LangChain','Datadog','Cloudflare','HashiCorp','Figma','Notion','Loom','Stripe','Plaid','PlanetScale','Segment','GitHub','Heroku','Mulesoft','SendGrid']

logo_map = {
    'Vercel': 'vercel', 'Supabase': 'supabase', 'Linear': 'linear', 'Prisma': 'prisma',
    'Railway': 'railway', 'Resend': 'resend', 'Turso': 'turso', 'Clerk': 'clerk',
    'Convex': 'convex', 'Upstash': 'upstash', 'Warp': 'warp', 'Cal.com': 'caldotcom',
    'OpenAI': 'openai', 'Anthropic': 'anthropic', 'Replicate': 'replicate',
    'Hugging Face': 'huggingface', 'LangChain': 'langchain', 'Datadog': 'datadog',
    'Cloudflare': 'cloudflare', 'HashiCorp': 'hashicorp', 'Figma': 'figma',
    'Notion': 'notion', 'Loom': 'loom', 'Stripe': 'stripe', 'PlanetScale': 'planetscale',
    'GitHub': 'github', 'Heroku': 'heroku', 'Mulesoft': 'mulesoft', 'SendGrid': 'sendgrid',
}

logos_dir = 'public/logos'
existing = set(os.listdir(logos_dir))

no_map = [c for c in companies if c not in logo_map]
print('Not in logoMap (8 companies):', no_map)

missing_file = [c for c, slug in logo_map.items() if f'{slug}.svg' not in existing]
print('In logoMap but file missing:', missing_file)

# Verify existing logo files are valid SVGs
for f in sorted(existing):
    path = os.path.join(logos_dir, f)
    with open(path) as fh:
        content = fh.read()
        if '<svg' not in content:
            print(f'INVALID SVG: {f}')
        elif len(content) < 80:
            print(f'TINY SVG ({len(content)} bytes): {f}')

print(f'\nTotal logos: {len(existing)}')
print(f'Companies in portfolio: {len(companies)}')
print(f'Companies with logos: {len(logo_map)}')
