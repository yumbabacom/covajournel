import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const startTime = Date.now();

    // Check database connection
    let dbStatus = 'disconnected';
    let dbResponseTime = 0;

    try {
      const dbStart = Date.now();
      await getDatabase();
      dbResponseTime = Date.now() - dbStart;
      dbStatus = 'connected';
    } catch (error) {
      console.error('Database health check failed:', error);
      dbStatus = 'error';
    }

    // Check environment variables
    const requiredEnvVars = [
      'MONGODB_URI',
      'JWT_SECRET',
      'NEXTAUTH_SECRET'
    ];

    const missingEnvVars = requiredEnvVars.filter(
      envVar => !process.env[envVar]
    );

    // Calculate total response time
    const totalResponseTime = Date.now() - startTime;

    // Determine overall health status
    const isHealthy = dbStatus === 'connected' && missingEnvVars.length === 0;

    const healthData = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024),
      },
      database: {
        status: dbStatus,
        responseTime: dbResponseTime,
      },
      environment_variables: {
        missing: missingEnvVars,
        count: requiredEnvVars.length - missingEnvVars.length,
        total: requiredEnvVars.length,
      },
      performance: {
        responseTime: totalResponseTime,
      },
      features: {
        fileUploads: process.env.ENABLE_FILE_UPLOADS !== 'false',
        adminPanel: process.env.ENABLE_ADMIN_PANEL !== 'false',
        registration: process.env.ENABLE_REGISTRATION !== 'false',
      }
    };

    // Return appropriate status code
    const statusCode = isHealthy ? 200 : 503;

    return NextResponse.json(healthData, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });

  } catch (error) {
    console.error('Health check error:', error);

    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  }
}

// Handle HEAD requests for simple health checks
export async function HEAD() {
  try {
    await getDatabase();
    return new NextResponse(null, { status: 200 });
  } catch {
    return new NextResponse(null, { status: 503 });
  }
}
