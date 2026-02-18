/**
 * Integration Tests for WaiverReports Page
 * Tests acceptance listing, filtering, statistics, CSV export
 */

import { render, screen, waitFor } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import { server } from '../../../mocks/server';
import { http, HttpResponse } from 'msw';
import WaiverReports from '../../../pages/admin/WaiverReports';

const API_BASE = 'http://localhost:8000/api/v1';

// Mock toast
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();
jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: Object.assign(jest.fn(), {
    error: (msg: string) => mockToastError(msg),
    success: (msg: string) => mockToastSuccess(msg),
  }),
}));

jest.mock('../../../components/Header', () => {
  return function MockHeader() {
    return <div data-testid="header">Header</div>;
  };
});

// Mock URL.createObjectURL and document methods for CSV export
const mockCreateObjectURL = jest.fn().mockReturnValue('blob:mock-url');
const mockRevokeObjectURL = jest.fn();
URL.createObjectURL = mockCreateObjectURL;
URL.revokeObjectURL = mockRevokeObjectURL;

const mockTemplates = {
  items: [
    {
      id: 'template-1',
      name: 'General Liability Waiver',
      waiver_type: 'liability',
      version: 2,
      is_active: true,
    },
    {
      id: 'template-2',
      name: 'Photo Release Form',
      waiver_type: 'photo_release',
      version: 1,
      is_active: true,
    },
  ],
  total: 2,
};

const mockAcceptances = {
  items: [
    {
      id: 'acc-1',
      user_id: 'user-1',
      user: {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@test.com',
      },
      signer_name: 'John Doe',
      waiver_template: {
        name: 'General Liability Waiver',
        waiver_type: 'liability',
      },
      waiver_version: 2,
      accepted_at: '2024-06-15T14:30:00Z',
      signer_ip: '192.168.1.100',
      signer_user_agent: 'Mozilla/5.0',
    },
    {
      id: 'acc-2',
      user_id: 'user-2',
      user: {
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@test.com',
      },
      signer_name: 'Jane Smith',
      waiver_template: {
        name: 'Photo Release Form',
        waiver_type: 'photo_release',
      },
      waiver_version: 1,
      accepted_at: '2024-06-20T10:00:00Z',
      signer_ip: '10.0.0.50',
      signer_user_agent: 'Chrome/120',
    },
    {
      id: 'acc-3',
      user_id: 'user-1',
      user: {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@test.com',
      },
      signer_name: 'John Doe',
      waiver_template: {
        name: 'Photo Release Form',
        waiver_type: 'photo_release',
      },
      waiver_version: 1,
      accepted_at: '2024-06-22T08:00:00Z',
      signer_ip: null,
      signer_user_agent: null,
    },
  ],
  total: 3,
};

describe('WaiverReports Page Integration Tests', () => {
  beforeEach(() => {
    localStorage.setItem('csf_access_token', 'mock-access-token-admin');
    localStorage.setItem('csf_refresh_token', 'mock-refresh-token-admin');
    mockToastSuccess.mockClear();
    mockToastError.mockClear();
    mockCreateObjectURL.mockClear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Page Loading', () => {
    it('should display loading state while fetching acceptances', () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockTemplates);
        }),
        http.get(`${API_BASE}/waivers/acceptances`, async () => {
          await new Promise((resolve) => setTimeout(resolve, 5000));
          return HttpResponse.json(mockAcceptances);
        })
      );

      render(<WaiverReports />);

      expect(screen.getByText('Loading acceptances...')).toBeInTheDocument();
    });

    it('should display page header', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockTemplates);
        }),
        http.get(`${API_BASE}/waivers/acceptances`, () => {
          return HttpResponse.json(mockAcceptances);
        })
      );

      render(<WaiverReports />);

      await waitFor(() => {
        expect(screen.getByText('Waiver Reports')).toBeInTheDocument();
      });

      expect(screen.getByText('View and analyze waiver acceptances')).toBeInTheDocument();
    });

    it('should display Export CSV button', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockTemplates);
        }),
        http.get(`${API_BASE}/waivers/acceptances`, () => {
          return HttpResponse.json(mockAcceptances);
        })
      );

      render(<WaiverReports />);

      await waitFor(() => {
        expect(screen.getByText(/CSV/)).toBeInTheDocument();
      });
    });
  });

  describe('Statistics Cards', () => {
    it('should display Total Acceptances stat', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockTemplates);
        }),
        http.get(`${API_BASE}/waivers/acceptances`, () => {
          return HttpResponse.json(mockAcceptances);
        })
      );

      render(<WaiverReports />);

      await waitFor(() => {
        expect(screen.getByText('Total Acceptances')).toBeInTheDocument();
        expect(screen.getByText('3')).toBeInTheDocument();
      });
    });

    it('should display Unique Users stat', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockTemplates);
        }),
        http.get(`${API_BASE}/waivers/acceptances`, () => {
          return HttpResponse.json(mockAcceptances);
        })
      );

      render(<WaiverReports />);

      await waitFor(() => {
        expect(screen.getByText('Unique Users')).toBeInTheDocument();
        // user-1 and user-2 = 2 unique users
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });

    it('should display Templates stat', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockTemplates);
        }),
        http.get(`${API_BASE}/waivers/acceptances`, () => {
          return HttpResponse.json(mockAcceptances);
        })
      );

      render(<WaiverReports />);

      await waitFor(() => {
        expect(screen.getByText('Templates')).toBeInTheDocument();
      });
    });

    it('should display Versions stat', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockTemplates);
        }),
        http.get(`${API_BASE}/waivers/acceptances`, () => {
          return HttpResponse.json(mockAcceptances);
        })
      );

      render(<WaiverReports />);

      await waitFor(() => {
        expect(screen.getByText('Versions')).toBeInTheDocument();
      });
    });
  });

  describe('Acceptances Table', () => {
    it('should display acceptance data in table', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockTemplates);
        }),
        http.get(`${API_BASE}/waivers/acceptances`, () => {
          return HttpResponse.json(mockAcceptances);
        })
      );

      render(<WaiverReports />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });

    it('should display user emails', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockTemplates);
        }),
        http.get(`${API_BASE}/waivers/acceptances`, () => {
          return HttpResponse.json(mockAcceptances);
        })
      );

      render(<WaiverReports />);

      await waitFor(() => {
        expect(screen.getByText('john@test.com')).toBeInTheDocument();
        expect(screen.getByText('jane@test.com')).toBeInTheDocument();
      });
    });

    it('should display waiver template names', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockTemplates);
        }),
        http.get(`${API_BASE}/waivers/acceptances`, () => {
          return HttpResponse.json(mockAcceptances);
        })
      );

      render(<WaiverReports />);

      await waitFor(() => {
        expect(screen.getByText('General Liability Waiver')).toBeInTheDocument();
      });
    });

    it('should display waiver type badges', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockTemplates);
        }),
        http.get(`${API_BASE}/waivers/acceptances`, () => {
          return HttpResponse.json(mockAcceptances);
        })
      );

      render(<WaiverReports />);

      await waitFor(() => {
        expect(screen.getByText('liability')).toBeInTheDocument();
        expect(screen.getAllByText('photo release').length).toBeGreaterThan(0);
      });
    });

    it('should display version numbers', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockTemplates);
        }),
        http.get(`${API_BASE}/waivers/acceptances`, () => {
          return HttpResponse.json(mockAcceptances);
        })
      );

      render(<WaiverReports />);

      await waitFor(() => {
        expect(screen.getByText('v2')).toBeInTheDocument();
        expect(screen.getAllByText('v1').length).toBe(2);
      });
    });

    it('should display IP addresses', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockTemplates);
        }),
        http.get(`${API_BASE}/waivers/acceptances`, () => {
          return HttpResponse.json(mockAcceptances);
        })
      );

      render(<WaiverReports />);

      await waitFor(() => {
        expect(screen.getByText('192.168.1.100')).toBeInTheDocument();
        expect(screen.getByText('10.0.0.50')).toBeInTheDocument();
      });
    });

    it('should display N/A for missing IP address', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockTemplates);
        }),
        http.get(`${API_BASE}/waivers/acceptances`, () => {
          return HttpResponse.json(mockAcceptances);
        })
      );

      render(<WaiverReports />);

      await waitFor(() => {
        const naCells = screen.getAllByText('N/A');
        expect(naCells.length).toBeGreaterThan(0);
      });
    });

    it('should display results count', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockTemplates);
        }),
        http.get(`${API_BASE}/waivers/acceptances`, () => {
          return HttpResponse.json(mockAcceptances);
        })
      );

      render(<WaiverReports />);

      await waitFor(() => {
        expect(screen.getByText('Showing 3 of 3 acceptances')).toBeInTheDocument();
      });
    });

    it('should display table column headers', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockTemplates);
        }),
        http.get(`${API_BASE}/waivers/acceptances`, () => {
          return HttpResponse.json(mockAcceptances);
        })
      );

      render(<WaiverReports />);

      await waitFor(() => {
        expect(screen.getByText('User')).toBeInTheDocument();
        expect(screen.getByText('Waiver Template')).toBeInTheDocument();
        expect(screen.getByText('Type')).toBeInTheDocument();
        expect(screen.getByText('Version')).toBeInTheDocument();
        expect(screen.getByText('Accepted At')).toBeInTheDocument();
        expect(screen.getByText('IP Address')).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    it('should display template filter', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockTemplates);
        }),
        http.get(`${API_BASE}/waivers/acceptances`, () => {
          return HttpResponse.json(mockAcceptances);
        })
      );

      render(<WaiverReports />);

      await waitFor(() => {
        expect(screen.getByText('Filter by Template')).toBeInTheDocument();
        expect(screen.getByText('All Templates')).toBeInTheDocument();
      });
    });

    it('should filter by template when selected', async () => {
      const user = userEvent.setup();
      let requestParams: any = null;

      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockTemplates);
        }),
        http.get(`${API_BASE}/waivers/acceptances`, ({ request }) => {
          const url = new URL(request.url);
          requestParams = {
            template_id: url.searchParams.get('template_id'),
          };
          return HttpResponse.json(mockAcceptances);
        })
      );

      render(<WaiverReports />);

      await waitFor(() => {
        expect(screen.getByText('All Templates')).toBeInTheDocument();
      });

      const templateFilter = screen.getByDisplayValue('All Templates').closest('select');
      if (templateFilter) {
        await user.selectOptions(templateFilter, 'template-1');
      }

      await waitFor(() => {
        expect(requestParams?.template_id).toBe('template-1');
      });
    });

    it('should display version filter', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockTemplates);
        }),
        http.get(`${API_BASE}/waivers/acceptances`, () => {
          return HttpResponse.json(mockAcceptances);
        })
      );

      render(<WaiverReports />);

      await waitFor(() => {
        expect(screen.getByText('Filter by Version')).toBeInTheDocument();
        expect(screen.getByText('All Versions')).toBeInTheDocument();
      });
    });

    it('should filter by version (client-side)', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockTemplates);
        }),
        http.get(`${API_BASE}/waivers/acceptances`, () => {
          return HttpResponse.json(mockAcceptances);
        })
      );

      render(<WaiverReports />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const versionFilter = screen.getByDisplayValue('All Versions').closest('select');
      if (versionFilter) {
        await user.selectOptions(versionFilter, '2');
      }

      await waitFor(() => {
        expect(screen.getByText('Showing 1 of 3 acceptances')).toBeInTheDocument();
      });
    });

    it('should display search input', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockTemplates);
        }),
        http.get(`${API_BASE}/waivers/acceptances`, () => {
          return HttpResponse.json(mockAcceptances);
        })
      );

      render(<WaiverReports />);

      await waitFor(() => {
        expect(screen.getByText('Search Users')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Name, email, or signer...')).toBeInTheDocument();
      });
    });

    it('should filter by search term (client-side)', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockTemplates);
        }),
        http.get(`${API_BASE}/waivers/acceptances`, () => {
          return HttpResponse.json(mockAcceptances);
        })
      );

      render(<WaiverReports />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Name, email, or signer...');
      await user.type(searchInput, 'Jane');

      await waitFor(() => {
        expect(screen.getByText('Showing 1 of 3 acceptances')).toBeInTheDocument();
      });
    });

    it('should search by email', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockTemplates);
        }),
        http.get(`${API_BASE}/waivers/acceptances`, () => {
          return HttpResponse.json(mockAcceptances);
        })
      );

      render(<WaiverReports />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Name, email, or signer...');
      await user.type(searchInput, 'jane@test.com');

      await waitFor(() => {
        expect(screen.getByText('Showing 1 of 3 acceptances')).toBeInTheDocument();
      });
    });
  });

  describe('CSV Export', () => {
    it('should export CSV when button clicked with data', async () => {
      const user = userEvent.setup();
      const appendChildSpy = jest.spyOn(document.body, 'appendChild');
      const removeChildSpy = jest.spyOn(document.body, 'removeChild');

      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockTemplates);
        }),
        http.get(`${API_BASE}/waivers/acceptances`, () => {
          return HttpResponse.json(mockAcceptances);
        })
      );

      render(<WaiverReports />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const exportButton = screen.getByText(/CSV/).closest('button');
      if (exportButton) {
        await user.click(exportButton);
      }

      expect(mockToastSuccess).toHaveBeenCalledWith('Exported successfully!');
      expect(mockCreateObjectURL).toHaveBeenCalled();

      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });

    it('should show error toast when no data to export', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockTemplates);
        }),
        http.get(`${API_BASE}/waivers/acceptances`, () => {
          return HttpResponse.json({ items: [], total: 0 });
        })
      );

      render(<WaiverReports />);

      await waitFor(() => {
        expect(screen.getByText('No waiver acceptances yet')).toBeInTheDocument();
      });

      const exportButton = screen.getByText(/CSV/).closest('button');
      if (exportButton) {
        await user.click(exportButton);
      }

      expect(mockToastError).toHaveBeenCalledWith('No data to export');
    });

    it('should disable export button when no data', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockTemplates);
        }),
        http.get(`${API_BASE}/waivers/acceptances`, () => {
          return HttpResponse.json({ items: [], total: 0 });
        })
      );

      render(<WaiverReports />);

      await waitFor(() => {
        const exportButton = screen.getByText(/CSV/).closest('button');
        expect(exportButton).toBeDisabled();
      });
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no acceptances', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockTemplates);
        }),
        http.get(`${API_BASE}/waivers/acceptances`, () => {
          return HttpResponse.json({ items: [], total: 0 });
        })
      );

      render(<WaiverReports />);

      await waitFor(() => {
        expect(screen.getByText('No waiver acceptances yet')).toBeInTheDocument();
      });
    });

    it('should display filtered empty state', async () => {
      const user = userEvent.setup();

      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockTemplates);
        }),
        http.get(`${API_BASE}/waivers/acceptances`, () => {
          return HttpResponse.json(mockAcceptances);
        })
      );

      render(<WaiverReports />);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Name, email, or signer...');
      await user.type(searchInput, 'xyznonexistent');

      await waitFor(() => {
        expect(screen.getByText('No acceptances match your filters')).toBeInTheDocument();
      });
    });

    it('should display zero stats when no acceptances', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockTemplates);
        }),
        http.get(`${API_BASE}/waivers/acceptances`, () => {
          return HttpResponse.json({ items: [], total: 0 });
        })
      );

      render(<WaiverReports />);

      await waitFor(() => {
        expect(screen.getByText('Total Acceptances')).toBeInTheDocument();
        const zeroValues = screen.getAllByText('0');
        expect(zeroValues.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error toast when acceptances fetch fails', async () => {
      server.use(
        http.get(`${API_BASE}/waivers/templates`, () => {
          return HttpResponse.json(mockTemplates);
        }),
        http.get(`${API_BASE}/waivers/acceptances`, () => {
          return HttpResponse.json({ message: 'Server Error' }, { status: 500 });
        })
      );

      render(<WaiverReports />);

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith(
          expect.stringContaining('Failed to load waiver acceptances')
        );
      });
    });
  });
});
