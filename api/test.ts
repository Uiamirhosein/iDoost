export default async function handler(req: any, res: any) {
  try {
    return res.status(200).json({ ok: true, message: 'Admin test endpoint alive', nodeVersion: process.version });
  } catch (err: any) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
